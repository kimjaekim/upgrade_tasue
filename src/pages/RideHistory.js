import React, { useState } from 'react';
import useRideTracking from '../hooks/useRideTracking';

function RideHistory() {
  const { rideHistory } = useRideTracking();
  const [selectedRide, setSelectedRide] = useState(null);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const RideDetailModal = ({ ride, onClose }) => (
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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            라이딩 상세
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          display: 'grid',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚴‍♂️</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#16a34a',
                marginBottom: '4px'
              }}>
                {ride.distance.toFixed(2)}km
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                이동 거리
              </div>
            </div>

            <div style={{
              background: '#ecfdf5',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#059669',
                marginBottom: '4px'
              }}>
                {formatDuration(ride.duration)}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                소요 시간
              </div>
            </div>

            <div style={{
              background: '#ddd6fe',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#7c3aed',
                marginBottom: '4px'
              }}>
                {ride.co2Saved.toFixed(3)}kg
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                CO₂ 절감
              </div>
            </div>

            <div style={{
              background: '#fef3c7',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#d97706',
                marginBottom: '4px'
              }}>
                {ride.points}점
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                획득 포인트
              </div>
            </div>
          </div>

          <div style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '12px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              라이딩 정보
            </h4>
            <div style={{
              display: 'grid',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div>
                <strong>시작 시간:</strong> {new Date(ride.startTime).toLocaleString('ko-KR')}
              </div>
              <div>
                <strong>종료 시간:</strong> {new Date(ride.endTime).toLocaleString('ko-KR')}
              </div>
              <div>
                <strong>평균 속도:</strong> {(ride.distance / (ride.duration / 3600)).toFixed(1)}km/h
              </div>
              <div>
                <strong>경로 포인트:</strong> {ride.route?.length || 0}개
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🌍</div>
          <div style={{
            fontSize: '14px',
            color: '#16a34a',
            fontWeight: '600'
          }}>
            이번 라이딩으로 나무 {Math.floor(ride.co2Saved * 45.45)}그루가<br />
            1년간 흡수하는 CO₂를 절약했습니다!
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{
        margin: '0 0 30px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937'
      }}>
        이동 기록
      </h1>

      {rideHistory.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '60px 30px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚴‍♂️</div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            아직 라이딩 기록이 없습니다
          </h3>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            자전거 라이딩을 시작하여<br />
            환경 보호에 기여해보세요!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {rideHistory.map((ride) => (
            <div
              key={ride.id}
              onClick={() => setSelectedRide(ride)}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {formatDate(ride.startTime)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {new Date(ride.startTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(ride.endTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{
                  background: '#16a34a',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  +{ride.points}점
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                <div style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#16a34a',
                    marginBottom: '2px'
                  }}>
                    {ride.distance.toFixed(2)}km
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    거리
                  </div>
                </div>

                <div style={{
                  background: '#ecfdf5',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#059669',
                    marginBottom: '2px'
                  }}>
                    {formatDuration(ride.duration)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    시간
                  </div>
                </div>

                <div style={{
                  background: '#ddd6fe',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#7c3aed',
                    marginBottom: '2px'
                  }}>
                    {ride.co2Saved.toFixed(3)}kg
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    CO₂ 절감
                  </div>
                </div>

                <div style={{
                  background: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#d97706',
                    marginBottom: '2px'
                  }}>
                    {(ride.distance / (ride.duration / 3600)).toFixed(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    km/h
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}
    </div>
  );
}

export default RideHistory;
