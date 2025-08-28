import React from "react";

function About() {
  return (
    <div>
      <h2 style={{ marginTop: 0, color: "#16a34a" }}>타슈 서비스 소개</h2>
      <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#374151", marginBottom: "24px" }}>
        녹색 성장을 선도하는 타슈 자전거 대여시스템은 자전거 이용의 생활화를 통한 시민건강 증진을 실현합니다.
      </p>
      
      <div style={{ 
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", 
        border: "1px solid #bbf7d0", 
        borderRadius: "12px", 
        padding: "20px", 
        marginBottom: "24px" 
      }}>
        <h3 style={{ color: "#16a34a", marginTop: 0, marginBottom: "16px" }}>서비스 특징</h3>
        <div style={{ display: "grid", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ 
              width: "24px", 
              height: "24px", 
              background: "#16a34a", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontSize: "12px", 
              fontWeight: "bold",
              flexShrink: 0
            }}>✓</div>
            <div>
              <strong>만 15세 이상</strong> 자전거 주행이 가능하면 누구나 이용 가능한 무인대여시스템
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ 
              width: "24px", 
              height: "24px", 
              background: "#16a34a", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontSize: "12px", 
              fontWeight: "bold",
              flexShrink: 0
            }}>✓</div>
            <div>
              <strong>CO2 발생 감소</strong>를 통한 저탄소 녹색성장 실현
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ 
              width: "24px", 
              height: "24px", 
              background: "#16a34a", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "white", 
              fontSize: "12px", 
              fontWeight: "bold",
              flexShrink: 0
            }}>✓</div>
            <div>
              <strong>자전거 교통수단 분담률</strong> 향상을 통한 시민건강 증진
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ 
          background: "#fff", 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px", 
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
          <h4 style={{ color: "#16a34a", marginBottom: "8px" }}>스마트락</h4>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            자전거 뒷바퀴 부착 잠금장치로 QR코드를 통한 스마트폰 대여 지원
          </p>
        </div>
        
        <div style={{ 
          background: "#fff", 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px", 
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🚲</div>
          <h4 style={{ color: "#16a34a", marginBottom: "8px" }}>공영자전거</h4>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            내구성이 강한 소재로 안전과 편의성을 최대한 반영한 설계
          </p>
        </div>
        
        <div style={{ 
          background: "#fff", 
          border: "1px solid #e5e7eb", 
          borderRadius: "12px", 
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏢</div>
          <h4 style={{ color: "#16a34a", marginBottom: "8px" }}>대여소</h4>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            지정된 장소에서만 이용 가능하며 1대용/5대용 거치대 운영
          </p>
        </div>
      </div>

      <div style={{ 
        background: "#fff", 
        border: "1px solid #e5e7eb", 
        borderRadius: "12px", 
        padding: "20px"
      }}>
        <h3 style={{ color: "#16a34a", marginTop: 0, marginBottom: "16px" }}>앱 다운로드</h3>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
          타슈 모바일 앱을 다운로드하여 더욱 편리하게 이용하세요
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="https://play.google.com/store/apps/details?id=kr.or.newtashu.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "#16a34a",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#15803d";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#16a34a";
              e.target.style.transform = "translateY(0)";
            }}
          >
            📱 Google Play
          </a>
          <a
            href="https://apps.apple.com/kr/app/id1634766279"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "#16a34a",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#15803d";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#16a34a";
              e.target.style.transform = "translateY(0)";
            }}
          >
            🍎 App Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;
