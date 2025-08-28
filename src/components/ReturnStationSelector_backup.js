import React, { useState, useRef, useEffect } from 'react';
import useStations from '../hooks/useStations';

function ReturnStationSelector({ startStation, onReturnStationSelect, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const { stations, loading } = useStations();
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);

  // Debug logging
  console.log('ReturnStationSelector props:', { 
    startStation: startStation ? {
      id: startStation.stationId || startStation.id,
      name: startStation.stationName || startStation.name,
      lat: startStation.stationLatitude || startStation.lat,
      lng: startStation.stationLongitude || startStation.lng
    } : null,
    stationsLoaded: !!stations,
    stationsCount: stations?.length || 0
  });

  useEffect(() => {
    console.log('ReturnStationSelector mounted with:', { 
      startStation: startStation ? startStation.stationName || startStation.name : null, 
      stationsCount: stations?.length,
      loading: loading
    });
    
    // Initialize map when component mounts
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  useEffect(() => {
    if (stations && stations.length > 0) {
      console.log('Stations loaded, updating map markers. Stations count:', stations.length);
      if (kakaoMapRef.current) {
        addStationMarkers();
      } else {
        console.log('Map not ready yet, will add markers after map initialization');
      }
    }
  }, [stations]);

  const initializeMap = async () => {
    if (!startStation) {
      console.error('StartStation data missing:', startStation);
      return;
    }

    const lat = startStation.stationLatitude || startStation.lat || 36.3504119;
    const lng = startStation.stationLongitude || startStation.lng || 127.3845475;

    // Load Kakao Maps SDK if not available
    if (!window.kakao || !window.kakao.maps) {
      console.log('Loading Kakao Maps SDK...');
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_APP_KEY}&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setTimeout(initializeMap, 100);
        });
      };
      document.head.appendChild(script);
      return;
    }

    const mapContainer = mapRef.current;
    if (!mapContainer) {
      console.error('Map container not found');
      setTimeout(initializeMap, 100);
      return;
    }

    const mapOption = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 4
    };

    try {
      kakaoMapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);
      console.log('Map initialized successfully');
      
      // Force map relayout after a short delay
      setTimeout(() => {
        if (kakaoMapRef.current) {
          kakaoMapRef.current.relayout();
        }
      }, 100);
      
    } catch (error) {
      console.error('Map initialization error:', error);
      return;
    }

    // 출발 대여소 마커 (빨간색)
    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: kakaoMapRef.current
    });

    const startInfoWindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:8px;font-size:12px;font-weight:600;color:#dc2626;">🚲 출발: ${startStation.stationName}</div>`
    });
    startInfoWindow.open(kakaoMapRef.current, startMarker);

    markersRef.current.push(startMarker);

    // Add markers for other stations if stations are loaded
    if (stations && stations.length > 0) {
      addStationMarkers();
    } else {
      console.log('Stations not loaded yet, waiting for stations data');
    }
  };

  const addStationMarkers = () => {
    if (!kakaoMapRef.current || !stations) {
      console.log('Cannot add markers - map or stations not ready');
      return;
    }

    console.log('Adding markers for', stations.length, 'stations');

    // Clear existing station markers (keep start marker)
    markersRef.current.slice(1).forEach(marker => marker.setMap(null));
    markersRef.current = markersRef.current.slice(0, 1);

    // Add markers for all other stations using same logic as main map
    let addedCount = 0;
    (stations || []).forEach((station, index) => {
      if (station.stationId === startStation?.stationId) return;

      // Use same coordinate extraction logic as main Map component
      const getLatLng = (s) => {
        const latRaw = s?.lat ?? s?.latitude ?? s?.stationLatitude;
        const lngRaw = s?.lng ?? s?.lon ?? s?.longitude ?? s?.stationLongitude;
        if (latRaw != null && lngRaw != null) return { lat: Number(latRaw), lng: Number(lngRaw) };
        
        const xRaw = s?.x_pos ?? s?.x ?? s?.X;
        const yRaw = s?.y_pos ?? s?.y ?? s?.Y;
        const x = Number(xRaw);
        const y = Number(yRaw);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return { lat: NaN, lng: NaN };
        
        const looksLatLng = (la, ln) => la >= 30 && la <= 45 && ln >= 120 && ln <= 140;
        let lat = y, lng = x;
        if (!looksLatLng(lat, lng) && looksLatLng(x, y)) { lat = x; lng = y; }
        return { lat: Number(lat), lng: Number(lng) };
      };

      const coords = getLatLng(station);
      
      console.log(`Adding marker ${index}:`, {
        name: station.stationName || station.name,
        id: station.stationId || station.id,
        coords: coords
      });

      if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
        console.warn('Station missing valid coordinates:', station);
        return;
      }

      try {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
          map: kakaoMapRef.current
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          console.log('Marker clicked:', station.stationName || station.name);
          selectReturnStation(station);
        });

        markersRef.current.push(marker);
        addedCount++;
      } catch (error) {
        console.error('Error creating marker for station:', station.stationName || station.name, error);
      }
    });

    console.log(`Successfully added ${addedCount} return station markers out of ${stations.length} total stations`);
  };

  const selectReturnStation = (station) => {
    setSelectedStation(station);
    
    // Use same coordinate extraction for both stations
    const getLatLng = (s) => {
      const latRaw = s?.lat ?? s?.latitude ?? s?.stationLatitude;
      const lngRaw = s?.lng ?? s?.lon ?? s?.longitude ?? s?.stationLongitude;
      if (latRaw != null && lngRaw != null) return { lat: Number(latRaw), lng: Number(lngRaw) };
      
      const xRaw = s?.x_pos ?? s?.x ?? s?.X;
      const yRaw = s?.y_pos ?? s?.y ?? s?.Y;
      const x = Number(xRaw);
      const y = Number(yRaw);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return { lat: NaN, lng: NaN };
      
      const looksLatLng = (la, ln) => la >= 30 && la <= 45 && ln >= 120 && ln <= 140;
      let lat = y, lng = x;
      if (!looksLatLng(lat, lng) && looksLatLng(x, y)) { lat = x; lng = y; }
      return { lat: Number(lat), lng: Number(lng) };
    };

    const startCoords = getLatLng(startStation);
    const returnCoords = getLatLng(station);
    
    // Calculate distance and estimated time
    const distance = calculateDistance(
      startCoords.lat,
      startCoords.lng,
      returnCoords.lat,
      returnCoords.lng
    );
    
    const estimatedTime = Math.round(distance * 4); // 4 minutes per km
    
    console.log('Selected return station:', {
      start: { name: startStation.stationName || startStation.name, coords: startCoords },
      return: { name: station.stationName || station.name, coords: returnCoords },
      distance: distance,
      estimatedTime: estimatedTime
    });
    
    // Call the parent callback with route data
    onReturnStationSelect({
      startStation: startStation,
      returnStation: station,
      distance: distance,
      estimatedTime: estimatedTime
    });
  };

  const filteredStations = (stations || []).filter(station => 
    station.stationId !== startStation?.stationId &&
    (station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     station.stationId?.toString().includes(searchQuery))
  );

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>대여소 정보를 불러오는 중...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>잠시만 기다려주세요</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            로딩 상태: {loading ? '로딩중' : '완료'} | 대여소 수: {stations?.length || 0}
          </div>
        </div>
      </div>
    );
  }

  // Show debug info if no stations loaded
  if (!stations || stations.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px', color: 'red' }}>대여소 데이터 없음</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            로딩 상태: {loading ? '로딩중' : '완료'}<br/>
            대여소 수: {stations?.length || 0}<br/>
            stations 타입: {typeof stations}<br/>
            stations 값: {JSON.stringify(stations)}
          </div>
          <button onClick={onCancel} style={{ marginTop: '16px', padding: '8px 16px' }}>
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

      {/* Start Station Info */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '4px'
        }}>
          출발 대여소
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          🚲 {startStation.stationName}
        </div>
      </div>

      {/* Search */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="반납할 대여소를 검색하거나 지도에서 선택하세요"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Map and Station List */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Map */}
        <div style={{ flex: 2, position: 'relative' }}>
          <div
            ref={mapRef}
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Map Instructions */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.9)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center',
            color: '#374151'
          }}>
            지도의 대여소를 클릭하여 반납지를 선택하세요
          </div>
        </div>

        {/* Station List */}
        <div style={{
          flex: 1,
          background: '#f8fafc',
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto',
          maxHeight: '100%'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            반납 가능한 대여소 ({filteredStations.length}개)
          </div>
          {filteredStations.map((station) => (
            <div
              key={station.stationId}
              onClick={() => selectReturnStation(station)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: selectedStation?.stationId === station.stationId ? '#dcfce7' : 'transparent'
              }}
              onMouseOver={(e) => e.target.style.background = '#f9fafb'}
              onMouseOut={(e) => e.target.style.background = selectedStation?.stationId === station.stationId ? '#dcfce7' : 'transparent'}
            >
              <div style={{
                fontWeight: '500',
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                {station.stationName}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                거치대: {station.rackTotCnt}개 | 자전거: {station.parkingBikeTotCnt}대
              </div>
              <div style={{
                fontSize: '12px',
                color: '#16a34a'
              }}>
                거리: {calculateDistance(
                  startStation.stationLatitude,
                  startStation.stationLongitude,
                  station.stationLatitude,
                  station.stationLongitude
                ).toFixed(2)}km
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Station Info */}
      {selectedStation && (
        <div style={{
          background: '#f9fafb',
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px',
            color: '#1f2937'
          }}>
            🏁 {selectedStation.stationName}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            거치대 {selectedStation.rackTotCnt}개 | 자전거 {selectedStation.parkingBikeTotCnt}대
          </div>
          <div style={{
            fontSize: '14px',
            color: '#16a34a',
            marginBottom: '12px'
          }}>
            예상 거리: {calculateDistance(
              startStation.stationLatitude,
              startStation.stationLongitude,
              selectedStation.stationLatitude,
              selectedStation.stationLongitude
            ).toFixed(2)}km
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        padding: '20px',
        background: '#fff',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handleConfirm}
          disabled={!selectedStation}
          style={{
            width: '100%',
            padding: '16px',
            background: selectedStation ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedStation ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          📱 QR코드 스캔하기
        </button>
      </div>
    </div>
  );
}

export default ReturnStationSelector;
