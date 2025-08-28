import React from 'react';

function RideCompletionScreen({ rideData, bikeData, onClose, onViewHistory }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분 ${secs}초`;
    }
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageSpeed = () => {
    const dur = Number(rideData?.duration || 0);
    const dist = Number(rideData?.distance || 0);
    if (!dur) return 0;
    return (dist / (dur / 3600)).toFixed(1);
  };

  const getEnvironmentalImpact = () => {
    const co2 = Number(rideData?.co2Saved || 0); // kg
    const dist = Number(rideData?.distance || 0); // km
    const treesEquivalent = (co2 / 22).toFixed(1); // 1그루 나무가 1년에 22kg CO2 흡수
    const carDistance = (dist * 0.8).toFixed(1); // 자동차 대신 자전거 이용
    return { treesEquivalent, carDistance };
  };

  const environmental = getEnvironmentalImpact();

  // Lightweight guard: if rideData is missing, show a minimal completion shell
  if (!rideData) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        zIndex: 2000, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉 라이딩 정리 중…</div>
          <button onClick={onClose} style={{
            padding: '12px 16px', background: 'rgba(255,255,255,0.9)', color: '#16a34a',
            border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600
          }}>닫기</button>
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
      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🎉
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          라이딩 완료!
        </h1>
        <div style={{
          fontSize: '14px',
          opacity: 0.9
        }}>
          {formatDate(rideData?.endTime || Date.now())}
        </div>
      </div>

      {/* Main Stats */}
      <div style={{
        flex: 1,
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Primary Stats Card */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {(Number(rideData?.distance || 0)).toFixed(2)}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8
              }}>
                킬로미터
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {formatTime(Number(rideData?.duration || 0)).split(' ')[0]}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8
              }}>
                {formatTime(Number(rideData?.duration || 0)).includes('시간') ? '시간' : '분'}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {getAverageSpeed()}km/h
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                평균 속도
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                +{Number(rideData?.points || 0).toLocaleString()}P
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                획득 포인트
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            🌱 환경 기여도
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {(Number(rideData?.co2Saved || 0) * 1000).toFixed(0)}g
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                CO₂ 절감
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {environmental.carDistance}km
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                자동차 절약
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            나무 {environmental.treesEquivalent}그루가 1년간 흡수하는 CO₂와 같은 양을 절약했습니다! 🌳
          </div>
        </div>

        {/* Route Info */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            🗺️ 경로 정보
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  출발지
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {rideData?.startLocation?.name || '시작 위치'}
                </div>
              </div>
            </div>
            
            <div style={{
              width: '2px',
              height: '20px',
              background: 'rgba(255,255,255,0.3)',
              marginLeft: '3px'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  도착지
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {rideData?.destination?.name || '도착 위치'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bike Info */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.8,
            marginBottom: '4px'
          }}>
            이용한 자전거
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🚲 {bikeData?.bikeId || ''}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <button
          onClick={onViewHistory}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          📊 기록 보기
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.9)',
            color: '#16a34a',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
          }}
        >
          🏠 홈으로
        </button>
      </div>
    </div>
  );
}

export default RideCompletionScreen;
