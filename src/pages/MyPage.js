import React, { useState } from 'react';

function MyPage({ user, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSave = () => {
    onUpdateUser({ ...user, ...editForm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const getUserLevel = (totalDistance) => {
    if (totalDistance >= 500) return { level: 5, name: '타슈 마스터', color: '#7c3aed' };
    if (totalDistance >= 200) return { level: 4, name: '에코 챔피언', color: '#dc2626' };
    if (totalDistance >= 100) return { level: 3, name: '그린 라이더', color: '#d97706' };
    if (totalDistance >= 50) return { level: 2, name: '친환경 라이더', color: '#059669' };
    return { level: 1, name: '타슈 비기너', color: '#16a34a' };
  };

  const userLevel = getUserLevel(user?.totalDistance || 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{
        margin: '0 0 30px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937'
      }}>
        마이페이지
      </h1>

      {/* 프로필 카드 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            fontWeight: '700'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {user?.name}
              </h2>
              <div style={{
                background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Lv.{userLevel.level} {userLevel.name}
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              가입일: {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>

        {/* 개인정보 */}
        <div style={{
          borderTop: '1px solid #f3f4f6',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              개인정보
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                수정
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {user?.name || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                휴대폰 번호
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {user?.phone || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                이메일
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {user?.email || '-'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚴‍♂️</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            {(user?.totalDistance || 0).toFixed(1)}km
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            총 라이딩 거리
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '4px'
          }}>
            {(user?.totalCO2Saved || 0).toFixed(2)}kg
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            CO₂ 절감량
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#7c3aed',
            marginBottom: '4px'
          }}>
            {(user?.totalPoints || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            총 포인트
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          계정 관리
        </h3>
        <button
          onClick={onLogout}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#b91c1c';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#dc2626';
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default MyPage;
