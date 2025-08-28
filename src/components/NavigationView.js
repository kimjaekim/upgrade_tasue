import React, { useState, useRef, useEffect } from 'react';
import useRideTracking from '../hooks/useRideTracking';

function NavigationView({ routeData, bikeData, user, onUpdateUser, onRideComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const fullRouteRef = useRef([]); // kakao LatLng array for full route
  const currentLocationMarkerRef = useRef(null);
  const geoWatchIdRef = useRef(null);

  const {
    isTracking,
    currentRide,
    startRide,
    startSimulatedRide,
    stopRide,
    cancelRide
  } = useRideTracking();

  // Helpers: normalize coordinates defensively
  const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
  const coerceNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const normalizePoint = (p) => {
    if (!p || typeof p !== 'object') return { lat: NaN, lng: NaN };
    // Try common keys first
    let latRaw = p.lat ?? p.latitude ?? p.stationLatitude;
    let lngRaw = p.lng ?? p.lon ?? p.long ?? p.longitude ?? p.stationLongitude;
    // Fallback to x/y styles (some payloads use x_pos=lat, y_pos=lng or vice versa)
    const xRaw = p.x_pos ?? p.x ?? p.X;
    const yRaw = p.y_pos ?? p.y ?? p.Y;
    let lat = coerceNum(latRaw);
    let lng = coerceNum(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const x = coerceNum(xRaw);
      const y = coerceNum(yRaw);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        // Assume (y,x) => (lat,lng), swap if needed
        lat = y; lng = x;
        if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
          lat = x; lng = y;
        }
      }
    }
    // Final sanity and fallback
    if (!looksLatLng(lat, lng)) {
      // eslint-disable-next-line no-console
      console.warn('[Nav] normalizePoint: invalid lat/lng, applying fallback', p);
      return { lat: 36.3504, lng: 127.3845 };
    }
    return { lat: Number(lat), lng: Number(lng) };
  };

  // Store normalized points for consistent use
  const normStartRef = useRef(null);
  const normDestRef = useRef(null);

  useEffect(() => {
    if (!routeData) return; // wait until routeData is available
    (async () => {
      // Debug: inspect route data
      // eslint-disable-next-line no-console
      try { console.log('[Nav] routeData ready', JSON.parse(JSON.stringify(routeData))); } catch { console.log('[Nav] routeData ready', routeData); }
      // eslint-disable-next-line no-console
      console.log(
        '[Nav] start/dest nums',
        Number(routeData?.startLocation?.lat),
        Number(routeData?.startLocation?.lng),
        Number(routeData?.destination?.lat),
        Number(routeData?.destination?.lng)
      );
      // Prepare normalized refs
      normStartRef.current = normalizePoint(routeData?.startLocation || routeData?.startCoords);
      normDestRef.current = normalizePoint(routeData?.destination || routeData?.returnCoords);
      // eslint-disable-next-line no-console
      console.log('[Nav] normalized', normStartRef.current, normDestRef.current);
      await ensureKakaoReady();
      await initializeMap();
      startRideTracking();
      // Auto-start simulation after QR scan (no GPS needed)
      const s = normStartRef.current;
      const d = normDestRef.current;
      const pts = (Array.isArray(routeData?.routePoints) && routeData.routePoints.length > 1)
        ? routeData.routePoints
        : (s && d ? [s, d] : []);
      if (pts.length >= 2) {
        startSimulatedRide(pts, 15);
      }
    })();

    return () => {
      cleanup();
    };
  }, [routeData]);

  const ensureKakaoReady = () =>
    new Promise((resolve) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => resolve());
        return;
      }
      const existing = document.querySelector('script[data-kakao-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => window.kakao.maps.load(() => resolve()));
        return;
      }
      const appKey = process.env.REACT_APP_KAKAO_APP_KEY;
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-kakao-sdk', 'true');
      script.onload = () => window.kakao.maps.load(() => resolve());
      document.head.appendChild(script);
    });

  const initializeMap = async () => {
    if (!window.kakao || !window.kakao.maps) return;

    const mapContainer = mapRef.current;
    // Debug: verify routeData just before creating the map
    // eslint-disable-next-line no-console
    console.log('[Nav] initializeMap with', routeData);
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords || { lat: 36.3504, lng: 127.3845 });
    const mapOption = {
      center: new window.kakao.maps.LatLng(s.lat, s.lng),
      level: 2
    };

    kakaoMapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);

    // 경로 표시
    drawRoute();
    
    // 시작점과 목적지 마커
    addStartEndMarkers();

    // 양 끝점이 보이도록 지도 범위 조정
    fitBoundsToStartEnd();
  };

  const drawRoute = () => {
    if (!kakaoMapRef.current) return;

    // routePoints가 없으면 시작-도착 직선 경로라도 표시
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords || { lat: 36.3504, lng: 127.3845 });
    const d = normDestRef.current || normalizePoint(routeData?.destination || routeData?.returnCoords || { lat: 36.3504, lng: 127.3845 });
    const basePoints = (routeData?.routePoints && routeData.routePoints.length > 1)
      ? routeData.routePoints
      : [
          { lat: s.lat, lng: s.lng },
          { lat: d.lat, lng: d.lng }
        ];

    // 숫자 변환 및 유효성 체크
    const points = basePoints
      .map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    if (points.length < 2) {
      // eslint-disable-next-line no-console
      console.error('유효한 좌표가 부족하여 경로를 표시할 수 없습니다.', basePoints);
      return;
    }

    const linePath = points.map(point =>
      new window.kakao.maps.LatLng(point.lat, point.lng)
    );
    fullRouteRef.current = linePath;

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#16a34a',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });

    polylineRef.current.setMap(kakaoMapRef.current);
  };

  const addStartEndMarkers = () => {
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords);
    const d = normDestRef.current || normalizePoint(routeData?.destination || routeData?.returnCoords);
    const sLat = Number(s.lat);
    const sLng = Number(s.lng);
    const dLat = Number(d.lat);
    const dLng = Number(d.lng);
    if (![sLat, sLng, dLat, dLng].every(Number.isFinite)) {
      // eslint-disable-next-line no-console
      console.error('마커 좌표가 유효하지 않습니다.', { sLat, sLng, dLat, dLng });
      return;
    }

    // 시작점 마커
    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(sLat, sLng),
      map: kakaoMapRef.current
    });

    const startInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:8px;font-size:12px;font-weight:600;color:#16a34a;">🚲 출발</div>'
    });
    startInfoWindow.open(kakaoMapRef.current, startMarker);

    // 목적지 마커
    const endMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(dLat, dLng),
      map: kakaoMapRef.current
    });

    const endInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:8px;font-size:12px;font-weight:600;color:#dc2626;">🏁 도착</div>'
    });
    endInfoWindow.open(kakaoMapRef.current, endMarker);

    markersRef.current.push(startMarker, endMarker);
  };

  const fitBoundsToStartEnd = () => {
    if (!kakaoMapRef.current) return;
    const s = normStartRef.current || normalizePoint(routeData.startLocation || routeData.startCoords);
    const d = normDestRef.current || normalizePoint(routeData.destination || routeData.returnCoords);
    const sLat = Number(s.lat);
    const sLng = Number(s.lng);
    const dLat = Number(d.lat);
    const dLng = Number(d.lng);
    if (![sLat, sLng, dLat, dLng].every(Number.isFinite)) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(new window.kakao.maps.LatLng(sLat, sLng));
    bounds.extend(new window.kakao.maps.LatLng(dLat, dLng));
    kakaoMapRef.current.setBounds(bounds);
  };

  const startRideTracking = () => {
    if (!routeData) return;
    const rideData = {
      bikeId: bikeData?.bikeId,
      startLocation: routeData?.startLocation || routeData?.startCoords,
      destination: routeData?.destination || routeData?.returnCoords,
      plannedRoute: routeData?.routePoints,
      plannedDistance: routeData?.distance || 0
    };

    startRide(rideData);
  };

  // Update moving bike marker and remaining path when currentRide location changes
  useEffect(() => {
    if (!kakaoMapRef.current || !currentRide?.currentLocation) return;
    const { lat, lng } = currentRide.currentLocation;

    // Bike icon marker
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }
    const bikeSvg = `
      <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="17" r="3.5" fill="#16a34a" stroke="#0f5132" stroke-width="1.5" />
        <circle cx="17" cy="17" r="3.5" fill="#16a34a" stroke="#0f5132" stroke-width="1.5" />
        <path d="M7 17l4-8h3l3 8" stroke="#0f5132" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M11 9l-2-3" stroke="#0f5132" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="11" cy="9" r="0.8" fill="#0f5132" />
      </svg>`;
    currentLocationMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: kakaoMapRef.current,
      image: new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + btoa(bikeSvg),
        new window.kakao.maps.Size(28, 28)
      )
    });

    // Shorten the polyline to show remaining route only
    if (polylineRef.current && fullRouteRef.current.length > 1) {
      // Find closest segment ahead and rebuild path from current point to end
      const cur = new window.kakao.maps.LatLng(lat, lng);
      let bestIdx = 0;
      let bestDist = Infinity;
      fullRouteRef.current.forEach((ll, idx) => {
        const dLat = cur.getLat() - ll.getLat();
        const dLng = cur.getLng() - ll.getLng();
        const d2 = dLat * dLat + dLng * dLng; // squared degrees distance (sufficient for nearest index)
        if (d2 < bestDist) { bestDist = d2; bestIdx = idx; }
      });
      const remaining = fullRouteRef.current.slice(bestIdx);
      // Prepend exact current position for smooth visual
      remaining[0] = cur;
      polylineRef.current.setPath(remaining);
    }

    // Keep center on rider
    kakaoMapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  }, [currentRide?.currentLocation]);

  const handleEndRide = async () => {
    if (!currentRide) return;

    const completedRide = await stopRide();
    
    if (completedRide && onUpdateUser) {
      // 사용자 통계 업데이트
      const updatedUser = {
        ...user,
        totalDistance: (user.totalDistance || 0) + completedRide.distance,
        totalPoints: (user.totalPoints || 0) + completedRide.points,
        totalRides: (user.totalRides || 0) + 1,
        totalCO2Saved: (user.totalCO2Saved || 0) + completedRide.co2Saved
      };
      
      onUpdateUser(updatedUser);
    }

    onRideComplete(completedRide);
  };

  const handleCancelRide = () => {
    cancelRide();
    onCancel();
  };

  const cleanup = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
  };

  const formatTime = (seconds) => {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual simulation trigger removed (auto-started after QR)

  const getRemainingDistance = () => {
    if (!routeData) return 0;
    if (!currentRide || !currentRide.currentLocation) return Number(routeData?.distance || 0);
    
    // 현재 위치에서 목적지까지의 거리 계산
    const R = 6371;
    const dest = routeData?.destination || routeData?.returnCoords;
    if (!dest) return Number(routeData?.distance || 0);
    const dLat = (dest.lat - currentRide.currentLocation.lat) * Math.PI / 180;
    const dLon = (dest.lng - currentRide.currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentRide.currentLocation.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#fff',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
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
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🚴‍♂️ 내비게이션
          </h2>
          <div style={{
            fontSize: '12px',
            opacity: 0.9,
            marginTop: '2px'
          }}>
            {bikeData?.bikeId || ''} • 배터리 {Number(bikeData?.batteryLevel ?? 0)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
          onClick={() => setShowEndConfirm(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          반납
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#16a34a'
          }}>
            {currentRide ? currentRide.distance.toFixed(2) : '0.00'}km
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            이동거리
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#3b82f6'
          }}>
            {currentRide ? formatTime(currentRide.duration) : '00:00'}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            소요시간
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#dc2626'
          }}>
            {getRemainingDistance().toFixed(2)}km
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            남은거리
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Navigation Instructions */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.95)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            목적지까지 직진
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {routeData?.destination?.name || routeData?.returnCoords?.name || ''}
          </div>
        </div>

        {/* Current Stats Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(22, 163, 74, 0.95)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              marginBottom: '4px'
            }}>
              CO₂ 절감
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {currentRide ? (currentRide.co2Saved * 1000).toFixed(0) : '0'}g
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              marginBottom: '4px'
            }}>
              획득 포인트
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600'
            }}>
              +{currentRide ? currentRide.points.toLocaleString() : '0'}P
            </div>
          </div>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            margin: '20px',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '320px',
            width: '100%'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              자전거를 반납하시겠습니까?
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              반납 시 현재까지의 기록이 저장됩니다.
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                계속하기
              </button>
              <button
                onClick={handleEndRide}
                style={{
                  padding: '12px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                반납하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationView;
