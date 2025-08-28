import React from "react";

function Usage() {
  const Step = ({ num, title, desc }) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: '#16a34a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700
        }}>{num}</div>
        <div style={{ fontWeight: 700, color: '#111827' }}>{title}</div>
      </div>
      <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto'
      }}>
        <h2 style={{ marginTop: 0, color: '#16a34a' }}>이용방법</h2>
        <p style={{ fontSize: 16, color: '#374151', marginBottom: 24 }}>
          QR로 간편하게 대여하고 원하는 대여소에 반납하세요. 대여 전 앱에서 대여 가능 수량과 대여소 위치를 확인할 수 있습니다.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}>
          <Step num={1} title="대여소 선택" desc="지도에서 가까운 대여소를 확인하고, 대여 가능 자전거가 있는지 확인합니다." />
          <Step num={2} title="QR 스캔" desc="자전거의 QR 코드를 카메라로 스캔하여 대여를 시작합니다." />
          <Step num={3} title="라이딩" desc="네비게이션 안내를 따라 목적지까지 안전하게 주행합니다. 앱에서 이동거리/시간을 확인할 수 있어요." />
          <Step num={4} title="반납" desc="목적지 인근의 대여소를 선택해 거치대에 반납합니다. 반납이 완료되면 포인트가 적립됩니다." />
        </div>

        <div style={{ marginTop: 24, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, color: '#15803d' }}>이용 팁</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#065f46', lineHeight: 1.8, fontSize: 14 }}>
            <li>1시간 이내 반납 후 재대여하면 추가요금 없이 반복 이용할 수 있습니다.</li>
            <li>라이트, 브레이크 등 안전장비를 꼭 확인하고 이용하세요.</li>
            <li>주행 중에는 휴대폰 사용을 자제하고, 교통 법규를 준수해주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Usage;
