import React from 'react';
import useRideTracking from '../hooks/useRideTracking';

function Dashboard({ user }) {
  const { getStats } = useRideTracking();
  const stats = getStats();

  const StatCard = ({ title, value, unit, color, icon }) => (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {title}
        </div>
        <div style={{ fontSize: '20px' }}>{icon}</div>
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: color,
        marginBottom: '4px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        {unit}
      </div>
    </div>
  );

  const PeriodStats = ({ title, data }) => (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        <div style={{
          background: '#f0fdf4',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>
            거리
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
            {data.distance.toFixed(1)}km
          </div>
        </div>
        <div style={{
          background: '#ecfdf5',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px' }}>
            CO₂ 절감
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
            {data.co2Saved.toFixed(2)}kg
          </div>
        </div>
        <div style={{
          background: '#ddd6fe',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '4px' }}>
            포인트
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#7c3aed' }}>
            {data.points}점
          </div>
        </div>
        <div style={{
          background: '#fef3c7',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#d97706', marginBottom: '4px' }}>
            라이딩
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#d97706' }}>
            {data.rides}회
          </div>
        </div>
      </div>
    </div>
  );

  const getUserLevel = (totalDistance) => {
    if (totalDistance >= 500) return { level: 5, name: '타슈 마스터', color: '#7c3aed', next: null };
    if (totalDistance >= 200) return { level: 4, name: '에코 챔피언', color: '#dc2626', next: 500 };
    if (totalDistance >= 100) return { level: 3, name: '그린 라이더', color: '#d97706', next: 200 };
    if (totalDistance >= 50) return { level: 2, name: '친환경 라이더', color: '#059669', next: 100 };
    return { level: 1, name: '타슈 비기너', color: '#16a34a', next: 50 };
  };

  const userLevel = getUserLevel(user?.totalDistance || 0);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            대시보드
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px'
          }}>
            {user?.name}님의 라이딩 현황을 확인하세요
          </p>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Lv.{userLevel.level} {userLevel.name}
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="총 라이딩 거리"
          value={stats.total.distance.toFixed(1)}
          unit="킬로미터"
          color="#16a34a"
          icon="🚴‍♂️"
        />
        <StatCard
          title="총 CO₂ 절감량"
          value={stats.total.co2Saved.toFixed(2)}
          unit="킬로그램"
          color="#059669"
          icon="🌱"
        />
        <StatCard
          title="총 포인트"
          value={stats.total.points.toLocaleString()}
          unit="포인트"
          color="#7c3aed"
          icon="⭐"
        />
        <StatCard
          title="총 라이딩 횟수"
          value={stats.total.rides}
          unit="회"
          color="#d97706"
          icon="🏆"
        />
      </div>

      {/* 레벨 진행률 */}
      {userLevel.next && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              다음 레벨까지
            </h3>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {(user?.totalDistance || 0).toFixed(1)}km / {userLevel.next}km
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, ((user?.totalDistance || 0) / userLevel.next) * 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${userLevel.color}, ${userLevel.color}dd)`,
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* 기간별 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <PeriodStats title="오늘" data={stats.today} />
        <PeriodStats title="이번 주" data={stats.week} />
        <PeriodStats title="이번 달" data={stats.month} />
      </div>

      {/* 환경 기여도 */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: '12px',
        padding: '30px',
        marginTop: '30px',
        textAlign: 'center',
        border: '1px solid #bbf7d0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: '#16a34a'
        }}>
          🌍 환경 기여도
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          color: '#374151',
          lineHeight: '1.6'
        }}>
          자전거 이용으로 <strong>{stats.total.co2Saved.toFixed(2)}kg</strong>의 CO₂ 배출을 줄였습니다!<br />
          이는 나무 <strong>{Math.floor(stats.total.co2Saved * 45.45)}</strong>그루가 1년간 흡수하는 CO₂와 같습니다.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌳</div>
            <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              나무 {Math.floor(stats.total.co2Saved * 45.45)}그루 효과
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚗</div>
            <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              자동차 {(stats.total.distance * 0.8).toFixed(1)}km 절약
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
