import React, { useState, useRef, useEffect } from 'react';
import useStations from '../hooks/useStations';

function ReturnStationSelector({ startStation, onReturnStationSelect, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const currentPosRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // 대여소 데이터를 가져오기 위해 useStations 훅 사용
  const { data: stations, loading, error } = useStations();

  // Debug logging
  console.log('ReturnStationSelector props:', {
    startStation: startStation ? {
      id: startStation.stationId || startStation.id,
      name: startStation.stationName || startStation.name,
      lat: startStation.stationLatitude || startStation.lat,
      lng: startStation.stationLongitude || startStation.lng
    } : null,
    stationsLoaded: !!stations,
    stationsCount: stations?.length || 0,
    loading: loading,
    error: error
  });

  useEffect(() => {
    console.log('ReturnStationSelector mounted with:', {
      startStation: startStation ? startStation.stationName || startStation.name : null,
      stationsCount: stations?.length,
      loading: loading
    });

    // Initialize map with delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  // 지도와 대여소 데이터 모두 준비되면 마커 추가 (mapReady + stations)
  useEffect(() => {
    console.log('Marker add check:', {
      stationsCount: stations?.length,
      mapReady,
      hasMap: !!kakaoMapRef.current,
      firstStation: stations?.[0]?.name
    });

    if (mapReady && stations && stations.length > 0 && kakaoMapRef.current) {
      console.log('Both map and stations ready - adding', stations.length, 'station markers');
      setTimeout(() => {
        addMarkersToMap(stations);
      }, 100);
    }
  }, [mapReady, stations]);

  // kakaoMapRef.current는 의존성으로 사용할 수 없으므로 mapReady로 제어

  const initializeMap = async () => {
    // Ensure Kakao Maps SDK is loaded
    const ensureKakaoReady = () => new Promise((resolve) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => resolve());
        return;
      }

      // Check if script already exists
      const existing = document.querySelector('script[data-kakao-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => window.kakao.maps.load(() => resolve()));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_KEY}&autoload=false`;
      script.setAttribute('data-kakao-sdk', 'true');
      script.onload = () => window.kakao.maps.load(() => resolve());
      document.head.appendChild(script);
    });

    try {
      await ensureKakaoReady();

      const container = mapRef.current;
      if (!container) {
        console.error('Map container not found, retrying...');
        setTimeout(initializeMap, 100);
        return;
      }

      // 초기 지도 중심 결정: 출발 대여소 -> 현재 위치 -> 대전 기본값
      let initialCenter = null;

      // 1) 출발 대여소 좌표 우선 사용
      if (startStation) {
        const xRaw = startStation?.x_pos ?? startStation?.x ?? startStation?.X ?? startStation?.stationLongitude ?? startStation?.lng;
        const yRaw = startStation?.y_pos ?? startStation?.y ?? startStation?.Y ?? startStation?.stationLatitude ?? startStation?.lat;
        const x = Number(xRaw);
        const y = Number(yRaw);
        const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
        let lat = y, lng = x;
        if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
          lat = x;
          lng = y;
        }
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          initialCenter = new window.kakao.maps.LatLng(lat, lng);
          console.log('출발 대여소로 지도 중심 설정:', lat, lng);
        }
      }

      // 2) 출발 대여소가 없거나 좌표가 불가하면 현재 위치 시도
      if (!initialCenter) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          initialCenter = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
          currentPosRef.current = {
            lat: Number(position.coords.latitude),
            lng: Number(position.coords.longitude)
          };
          console.log('현재 위치로 지도 중심 설정:', position.coords.latitude, position.coords.longitude);
        } catch (geoError) {
          console.log('현재 위치를 가져올 수 없어 대전 중심으로 설정:', geoError.message);
        }
      }

      // 3) 최종 폴백: 대전 중심
      if (!initialCenter) {
        initialCenter = new window.kakao.maps.LatLng(36.3504, 127.3845);
      }

      const options = {
        center: initialCenter,
        level: 3 // 더 가까운 줌 (약 200~300m 수준)
      };

      kakaoMapRef.current = new window.kakao.maps.Map(container, options);
      console.log('Map initialized successfully');
      setMapReady(true);

      // 지도 크기 재조정 (중요: 컨테이너 크기 변경 후 필요)
      setTimeout(() => {
        if (kakaoMapRef.current) {
          kakaoMapRef.current.relayout();
          console.log('Map relayout completed');
        }
      }, 100);

      // 지도 준비 로그
      console.log('Map ready. Marker addition will trigger when stations arrive.');
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const addMarkersToMap = (stations) => {
    if (!kakaoMapRef.current || !stations?.length) {
      console.log('Cannot add markers - map or stations not available:', {
        hasMap: !!kakaoMapRef.current,
        stationsCount: stations?.length || 0
      });
      return;
    }

    console.log('Adding markers for', stations.length, 'stations');

    // 기존 마커들 제거
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    const getLatLng = (s) => {
      const xRaw = s?.x_pos ?? s?.x ?? s?.X ?? s?.stationLongitude ?? s?.lng;
      const yRaw = s?.y_pos ?? s?.y ?? s?.Y ?? s?.stationLatitude ?? s?.lat;
      const x = Number(xRaw);
      const y = Number(yRaw);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        console.log('Invalid coordinates for station:', s?.name || s?.stationName, { x: xRaw, y: yRaw });
        return { lat: NaN, lng: NaN };
      }

      // 한국 좌표 범위 확인
      const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
      let lat = y, lng = x;
      if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
        lat = x;
        lng = y;
      }

      return { lat: Number(lat), lng: Number(lng) };
    };

    let addedCount = 0;
    let validStations = [];

    stations.forEach((station) => {
      const coords = getLatLng(station);
      if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;

      validStations.push({ station, coords });

      // 출발지 비교 로직 개선 - 정확한 ID나 이름 매칭만
      const isStartStation = startStation && (
        (startStation.id && (station.id === startStation.id || station.stationId === startStation.id)) ||
        (startStation.stationId && (station.id === startStation.stationId || station.stationId === startStation.stationId)) ||
        (startStation.name && station.name === startStation.name) ||
        (startStation.stationName && station.name === startStation.stationName)
      );

      // 디버깅 로그 제거 (너무 많은 로그 방지)

      // 출발 대여소는 건너뛰기 (반납 대여소 선택 화면이므로)
      if (isStartStation) {
        console.log('Skipping start station:', station.name || station.stationName);
        return;
      }

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
        map: kakaoMapRef.current
      });

      // 반납 가능한 대여소 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        console.log('반납 대여소 선택:', station.name || station.stationName);
        selectReturnStation(station);
      });

      // 반납 가능한 대여소 정보 표시
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:8px;font-size:12px;background:white;border:2px solid #16a34a;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">🚲 <strong>${station.name || station.stationName}</strong><br/><span style="color:#16a34a;font-weight:600;font-size:11px;">📍 반납 가능 • 클릭하여 선택</span></div>`
      });

      // 마커 호버 이벤트
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infoWindow.open(kakaoMapRef.current, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
      addedCount++;
    });

    console.log(`Successfully added ${addedCount} return station markers to map`);
    console.log('Valid return stations with coordinates:', validStations.filter(vs => {
      const s = vs.station;
      const isStart = (
        (startStation?.id && (s.id === startStation.id || s.stationId === startStation.id)) ||
        (startStation?.stationId && (s.id === startStation.stationId || s.stationId === startStation.stationId)) ||
        (startStation?.name && s.name === startStation.name) ||
        (startStation?.stationName && s.name === startStation.stationName)
      );
      return !isStart;
    }).map(vs => ({
      name: vs.station.name || vs.station.stationName,
      coords: vs.coords
    })));

    // 요구사항: 시작 대여소 기준으로 약 300m 줌을 유지해야 하므로
    // 전체 마커에 맞춰 자동으로 축소/확대(setBounds)하지 않습니다.
    if (addedCount === 0) {
      console.warn('No return station markers were added to the map');
    }

    // 시작 대여소 좌표로 애니메이션을 주며 센터/레벨 맞추기
    if (startStation && kakaoMapRef.current) {
      const xRaw = startStation?.x_pos ?? startStation?.x ?? startStation?.X ?? startStation?.stationLongitude ?? startStation?.lng;
      const yRaw = startStation?.y_pos ?? startStation?.y ?? startStation?.Y ?? startStation?.stationLatitude ?? startStation?.lat;
      const x = Number(xRaw);
      const y = Number(yRaw);
      const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
      let lat = y, lng = x;
      if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
        lat = x;
        lng = y;
      }
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const ll = new window.kakao.maps.LatLng(lat, lng);
        kakaoMapRef.current.setCenter(ll);
        // 레벨 3은 약 200~300m 범위. animate 옵션으로 부드럽게 줌 전환
        kakaoMapRef.current.setLevel(3, { animate: true });
        console.log('Centered and zoomed to start station with animation:', lat, lng);
      }
    }
  };

  const selectReturnStation = (station) => {
    console.log('반납 대여소 선택됨:', station.name || station.stationName);

    // 선택된 대여소 하이라이트 표시
    markersRef.current.forEach(marker => {
      // 기존 마커들의 인포윈도우 닫기
      marker.infoWindow?.close();
    });

    // 선택된 대여소에 확인 인포윈도우 표시
    const selectedMarker = markersRef.current.find(marker => {
      const pos = marker.getPosition();
      const stationCoords = getStationCoords(station);
      return Math.abs(pos.getLat() - stationCoords.lat) < 0.0001 &&
        Math.abs(pos.getLng() - stationCoords.lng) < 0.0001;
    });

    if (selectedMarker) {
      const confirmWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:12px;background:#16a34a;color:white;border-radius:4px;text-align:center;">✅ 반납지 선택됨<br/><strong>${station.name || station.stationName}</strong><br/><span style="font-size:10px;">QR 스캔으로 이동 중...</span></div>`
      });
      confirmWindow.open(kakaoMapRef.current, selectedMarker);
    }

    // 다음 단계로 즉시 이동 (지연 제거)
    // Build explicit coords
    const destCoords = getStationCoords(station);
    let startCoords = startStation ? getStationCoords(startStation) : null;
    if (!startCoords || !Number.isFinite(startCoords.lat) || !Number.isFinite(startCoords.lng)) {
      if (currentPosRef.current && Number.isFinite(currentPosRef.current.lat) && Number.isFinite(currentPosRef.current.lng)) {
        startCoords = { ...currentPosRef.current };
      } else {
        startCoords = { lat: 36.3504, lng: 127.3845 }; // Daejeon center fallback
      }
    }

    onReturnStationSelect({
      startStation: startStation,
      returnStation: station,
      startCoords,
      returnCoords: destCoords,
      distance: 0,
      estimatedTime: 0
    });
  };

  const getStationCoords = (station) => {
    const xRaw = station?.x_pos ?? station?.x ?? station?.X ?? station?.stationLongitude ?? station?.lng;
    const yRaw = station?.y_pos ?? station?.y ?? station?.Y ?? station?.stationLatitude ?? station?.lat;
    const x = Number(xRaw);
    const y = Number(yRaw);

    const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
    let lat = y, lng = x;
    if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
      lat = x;
      lng = y;
    }

    return { lat: Number(lat), lng: Number(lng) };
  };


  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚲</div>
          <div style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>지도를 준비하는 중...</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>대여소 정보를 불러오고 있습니다</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            로딩 상태: {loading ? '로딩중' : '완료'} | 대여소 수: {stations?.length || 0}
          </div>
        </div>
      </div>
    );
  }

  // Show debug info if no stations loaded
  if (!loading && (!stations || stations.length === 0)) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <div style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>대여소 정보를 불러올 수 없습니다</div>
          <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9, lineHeight: '1.5' }}>
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.<br />
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              로딩 상태: {loading ? '로딩중' : '완료'} | 대여소 수: {stations?.length || 0}<br />
              에러: {error || '없음'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              새로고침
            </button>
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600'
        }}>
          반납 대여소 선택
        </h2>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* Start Station Info */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        padding: '16px 20px',
        borderBottom: '1px solid #bbf7d0'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#16a34a',
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          🚲 출발 대여소
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#15803d'
        }}>
          {startStation?.stationName || startStation?.name || '선택된 대여소'}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#16a34a',
          marginTop: '4px',
          opacity: 0.8
        }}>
          이곳에서 자전거를 대여하여 반납지로 이동합니다
        </div>
      </div>


      {/* Full Screen Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          ref={mapRef}
          id="return-station-map"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '70vh',
            position: 'relative',
            zIndex: 1
          }}
        />

        {/* Map Instructions */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(22, 163, 74, 0.95)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '16px',
          textAlign: 'center',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          🗺️ 자전거를 반납할 대여소를 선택하세요
          <div style={{
            fontSize: '12px',
            marginTop: '8px',
            opacity: 0.9,
            fontWeight: '400'
          }}>
            지도의 마커를 클릭하면 해당 대여소가 선택됩니다
          </div>
        </div>

        {/* Station Count Info */}
        {stations && stations.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#6b7280',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            📍 총 {stations.length}개 대여소
          </div>
        )}
      </div>

    </div>
  );
}

export default ReturnStationSelector;
