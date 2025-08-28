import React, { useState, useRef, useEffect } from 'react';

function DestinationSelector({ startLocation, onDestinationSelect, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    initializeMap();
    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  const initializeMap = async () => {
    if (!window.kakao || !window.kakao.maps) return;

    const mapContainer = mapRef.current;
    const mapOption = {
      center: new window.kakao.maps.LatLng(startLocation.lat, startLocation.lng),
      level: 3
    };

    kakaoMapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);

    // 시작 위치 마커
    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(startLocation.lat, startLocation.lng),
      map: kakaoMapRef.current
    });

    const startInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;">출발지</div>'
    });
    startInfoWindow.open(kakaoMapRef.current, startMarker);

    markersRef.current.push(startMarker);

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(kakaoMapRef.current, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      selectDestinationOnMap(latlng.getLat(), latlng.getLng());
    });
  };

  const searchPlaces = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Kakao Places API 시뮬레이션
    const mockResults = [
      {
        id: '1',
        place_name: `${query} 관련 장소 1`,
        address_name: '대전광역시 중구 은행동',
        x: 127.3845475 + (Math.random() - 0.5) * 0.01,
        y: 36.3504119 + (Math.random() - 0.5) * 0.01
      },
      {
        id: '2',
        place_name: `${query} 관련 장소 2`,
        address_name: '대전광역시 서구 둔산동',
        x: 127.3845475 + (Math.random() - 0.5) * 0.01,
        y: 36.3504119 + (Math.random() - 0.5) * 0.01
      },
      {
        id: '3',
        place_name: `${query} 관련 장소 3`,
        address_name: '대전광역시 유성구 봉명동',
        x: 127.3845475 + (Math.random() - 0.5) * 0.01,
        y: 36.3504119 + (Math.random() - 0.5) * 0.01
      }
    ];

    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const selectDestinationOnMap = (lat, lng) => {
    // 기존 목적지 마커 제거
    markersRef.current.forEach((marker, index) => {
      if (index > 0) marker.setMap(null);
    });
    markersRef.current = markersRef.current.slice(0, 1);

    // 새 목적지 마커 추가
    const destMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: kakaoMapRef.current
    });

    const destInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:5px;font-size:12px;">목적지</div>'
    });
    destInfoWindow.open(kakaoMapRef.current, destMarker);

    markersRef.current.push(destMarker);

    setSelectedDestination({
      lat,
      lng,
      name: '선택한 위치',
      address: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`
    });
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    
    selectDestinationOnMap(lat, lng);
    setSelectedDestination({
      lat,
      lng,
      name: result.place_name,
      address: result.address_name
    });
    setSearchResults([]);
    setSearchQuery(result.place_name);
  };

  const calculateRoute = () => {
    if (!selectedDestination) return;

    const distance = calculateDistance(
      startLocation.lat,
      startLocation.lng,
      selectedDestination.lat,
      selectedDestination.lng
    );

    const routeData = {
      startLocation,
      destination: selectedDestination,
      distance,
      estimatedTime: Math.ceil(distance / 15 * 60), // 15km/h 평균 속도로 계산 (분)
      routePoints: generateRoutePoints(startLocation, selectedDestination)
    };

    onDestinationSelect(routeData);
  };

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

  const generateRoutePoints = (start, end) => {
    // 간단한 직선 경로 생성 (실제로는 Kakao Directions API 사용)
    const points = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      points.push({ lat, lng });
    }
    
    return points;
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
        background: '#16a34a',
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
          목적지 선택
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

      {/* Search */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchPlaces(e.target.value);
            }}
            placeholder="목적지를 검색하거나 지도를 터치하세요"
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
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => selectSearchResult(result)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  <div style={{
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {result.place_name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {result.address_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
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
          지도를 터치하여 목적지를 선택하세요
        </div>
      </div>

      {/* Selected Destination Info */}
      {selectedDestination && (
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
            {selectedDestination.name}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '12px'
          }}>
            {selectedDestination.address}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#16a34a',
            marginBottom: '16px'
          }}>
            예상 거리: {calculateDistance(
              startLocation.lat,
              startLocation.lng,
              selectedDestination.lat,
              selectedDestination.lng
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
          onClick={calculateRoute}
          disabled={!selectedDestination}
          style={{
            width: '100%',
            padding: '16px',
            background: selectedDestination ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedDestination ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          🚴‍♂️ 라이딩 시작
        </button>
      </div>
    </div>
  );
}

export default DestinationSelector;
