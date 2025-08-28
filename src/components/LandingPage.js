import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage({ onLogin }) {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (formData.phone && formData.password) {
        onLogin({ phone: formData.phone, name: '타슈 사용자' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div style={{ 
      background: '#fff',
      minHeight: '100vh'
    }}>
      {/* Navigation Header */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(22, 163, 74, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            color: 'white',
            letterSpacing: '-0.5px'
          }}>
            타슈
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => scrollToSection('login')}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              로그인
            </button>
            <button 
              onClick={() => scrollToSection('service')}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              서비스 안내
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              타슈란?
            </button>
            <button 
              onClick={() => scrollToSection('usage')}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              이용방법
            </button>
            <button 
              onClick={() => scrollToSection('download')}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              앱 다운로드
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        color: 'white',
        padding: '120px 20px 80px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            letterSpacing: '-2px'
          }}>
            대전 시민공영자전거 타슈
          </h1>
          <p style={{
            fontSize: '20px',
            opacity: 0.9,
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            녹색 성장을 선도하는 친환경 자전거 대여시스템<br />
            자전거 이용의 생활화를 통한 시민건강 증진을 실현합니다
          </p>
          <button
            onClick={() => scrollToSection('login')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            지금 시작하기
          </button>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" style={{
        padding: '80px 20px',
        background: '#f8fafc'
      }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#16a34a',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            로그인
          </h2>
          
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '40px'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              만 15세 이상 자전거 주행이 가능하면<br />
              누구나 이용하실 수 있습니다
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '20px'
            }}>
              <Link to="/signup" style={{ color: '#16a34a', textDecoration: 'none' }}>
                회원가입
              </Link>
              <span style={{ margin: '0 8px' }}>•</span>
              <a href="#" style={{ color: '#16a34a', textDecoration: 'none' }}>
                비밀번호 찾기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Service Guide Section */}
      <section id="service" style={{
        padding: '80px 20px',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#16a34a',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            서비스 안내
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* 이용안내 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>이용안내</h3>
              <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>
                이용대상: 만 15세 이상 자전거 주행이 가능한 자<br/>
                대여시간: 05시 ~ 24시<br/>
                반납시간: 24시간
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
                ※ 이용 성수기인 3월부터 11월까지는 24시간 운영합니다.
              </p>
            </div>

            {/* 요금안내 */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>요금안내</h3>
              <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>
                기본 사용료: 1시간 무료<br/>
                추가 사용료: 30분당 500원 / 1일 1회당 최대 추가 사용료는 5,000원
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
                * 1시간 내 반납 후 재대여하면 추가요금 없이 반복 이용 가능
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: '80px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#16a34a',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            타슈란?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px'
              }}>
                🔒
              </div>
              <h3 style={{ color: '#16a34a', marginBottom: '16px' }}>스마트락</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                자전거의 뒷바퀴에 부착하는 잠금장치이며 스마트폰 및 서비스 서버와의 통신을 통하여 승인된 사용자인 경우 QR코드로 스마트폰을 이용한 대여기능을 지원합니다.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px'
              }}>
                🚲
              </div>
              <h3 style={{ color: '#16a34a', marginBottom: '16px' }}>공영자전거</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                공영자전거는 누구나 편리하게 이용할 수 있도록 설계되었으며, 내구성이 강한 소재를 적용하여 안전과 편의성을 최대한 반영하였습니다.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '32px'
              }}>
                🏢
              </div>
              <h3 style={{ color: '#16a34a', marginBottom: '16px' }}>대여소</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                공영자전거 타슈는 대여소로 지정된 장소에서만 이용하실 수 있으며 대여소에 설치된 1대용 및 5대용 거치대를 운영합니다.
              </p>
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', 
            border: '1px solid #bbf7d0', 
            borderRadius: '20px', 
            padding: '40px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#16a34a', marginBottom: '20px', fontSize: '24px' }}>환경을 생각하는 선택</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
                  CO2 감소
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  자전거 교통수단 분담률 향상
                </div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
                  시민건강 증진
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  자전거 이용의 생활화
                </div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
                  저탄소 녹색성장
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  국가 비전 실현
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Section */}
      <section id="usage" style={{
        padding: '80px 20px',
        background: '#f8fafc'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#16a34a',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            이용방법
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { step: '01', title: '회원가입', desc: '타슈 앱을 다운로드하고 회원가입을 진행하세요', icon: '📱' },
              { step: '02', title: '대여소 찾기', desc: '지도에서 가까운 대여소를 찾아보세요', icon: '🗺️' },
              { step: '03', title: 'QR코드 스캔', desc: '자전거의 QR코드를 스캔하여 대여하세요', icon: '📷' },
              { step: '04', title: '안전한 이용', desc: '헬멧을 착용하고 안전하게 이용하세요', icon: '🪖' },
              { step: '05', title: '반납하기', desc: '이용 후 대여소에 안전하게 반납하세요', icon: '🔄' }
            ].map((item, index) => (
              <div key={index} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '24px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#16a34a',
                  marginBottom: '8px',
                  letterSpacing: '2px'
                }}>
                  STEP {item.step}
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            타슈 앱 다운로드
          </h2>
          <p style={{
            fontSize: '18px',
            opacity: 0.9,
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            타슈 모바일 앱을 다운로드하여<br />
            더욱 편리하게 자전거를 이용하세요
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://play.google.com/store/apps/details?id=kr.or.newtashu.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📱 Google Play
            </a>
            <a
              href="https://apps.apple.com/kr/app/id1634766279"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🍎 App Store
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1f2937',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            타슈
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.7,
            marginBottom: '20px'
          }}>
            대전 시민공영자전거 서비스
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.5
          }}>
            © Tashu, Daejeon City. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
