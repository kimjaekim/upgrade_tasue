import React from 'react';
import useRideTracking from '../hooks/useRideTracking';

function RideTracker({ user, onUpdateUser }) {
  const {
    isTracking,
    currentRide,
    startRide,
    stopRide,
    cancelRide
  } = useRideTracking();

  const handleStartRide = () => {
    const success = startRide();
    if (!success) {
      alert('라이딩을 시작할 수 없습니다. GPS 권한을 확인해주세요.');
    }
  };

  const handleStopRide = () => {
    const completedRide = stopRide();
    if (completedRide && user) {
      // Update user stats
      const updatedUser = {
        ...user,
        totalDistance: user.totalDistance + completedRide.distance,
        totalCO2Saved: user.totalCO2Saved + completedRide.co2Saved,
        totalPoints: user.totalPoints + completedRide.points
      };
      onUpdateUser(updatedUser);
      
      alert(`라이딩 완료!\n거리: ${completedRide.distance.toFixed(2)}km\nCO₂ 절감: ${completedRide.co2Saved.toFixed(2)}kg\n포인트: ${completedRide.points}점`);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDuration = () => {
    if (!currentRide || !currentRide.startTime) return 0;
    return Math.floor((new Date() - new Date(currentRide.startTime)) / 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      padding: '20px',
      minWidth: '280px',
      zIndex: 1000,
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isTracking ? '#22c55e' : '#6b7280'
        }} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          라이딩 추적
        </h3>
      </div>

      {isTracking && currentRide ? (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: '#f0fdf4',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '2px' }}>
                거리
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                {currentRide.distance.toFixed(2)}km
              </div>
            </div>
            <div style={{
              background: '#f0fdf4',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '2px' }}>
                시간
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                {formatTime(getCurrentDuration())}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: '#ecfdf5',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#059669', marginBottom: '2px' }}>
                CO₂ 절감
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                {currentRide.co2Saved.toFixed(3)}kg
              </div>
            </div>
            <div style={{
              background: '#ecfdf5',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#059669', marginBottom: '2px' }}>
                포인트
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                {currentRide.points}점
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px 0',
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          자전거 라이딩을 시작하세요!
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isTracking ? (
          <button
            onClick={handleStartRide}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚴‍♂️ 시작
          </button>
        ) : (
          <>
            <button
              onClick={handleStopRide}
              style={{
                flex: 1,
                padding: '12px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#b91c1c';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ⏹️ 완료
            </button>
            <button
              onClick={cancelRide}
              style={{
                padding: '12px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#4b5563';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#6b7280';
              }}
            >
              ❌
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RideTracker;
