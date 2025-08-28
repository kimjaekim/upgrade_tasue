import React from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import "./App.css";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Stations from "./pages/Stations";
import Favorites from "./pages/Favorites";
import Notice from "./pages/Notice";
import About from "./pages/About";
import Usage from "./pages/Usage";
import Dashboard from "./pages/Dashboard";
import MyPage from "./pages/MyPage";
import RideHistory from "./pages/RideHistory";
import BikeRental from "./pages/BikeRental";
import useAuth from "./hooks/useAuth";
import Signup from "./pages/Signup";

// 활성 네비게이션은 클래스 토글로 처리 (App.css의 .nav-item.is-active)

function App() {
  const { user, loading, login, logout, updateUser, isAuthenticated } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (!result.success) {
      alert(result.error || '로그인에 실패했습니다.');
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-inner">
          <div className="loading-emoji">🚲</div>
          <div className="loading-title">타슈 로딩 중...</div>
        </div>
      </div>
    );
  }

  // Render different route sets based on auth state
  return (
    <div>
      {user && isAuthenticated && (
        <>
      <Header user={user} onLogout={logout} />
      <div className="app-shell">
        <aside className="sidebar alt">
          <h2 className="section-title">메뉴</h2>
          <nav className="nav-grid">
            <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🏠 대시보드</NavLink>
            <NavLink to="/map" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🗺️ 지도</NavLink>
            <NavLink to="/stations" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🚲 대여소</NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>📊 이동기록</NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>⭐ 즐겨찾기</NavLink>
            <NavLink to="/mypage" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>👤 마이페이지</NavLink>
            <NavLink to="/usage" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>📘 이용방법</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>ℹ️ 서비스 안내</NavLink>
          </nav>

          <div style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ margin: "0 0 8px", fontSize: 16 }}>사용자 정보</h3>
            <div className="card">
              <div className="name">{user?.name}</div>
              <div className="muted">총 {(user?.totalDistance || 0).toFixed(1)}km 라이딩</div>
              <div className="text-green" style={{ fontSize: "12px", fontWeight: 500 }}>
                {(user?.totalPoints || 0).toLocaleString()}포인트
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#16a34a" }}>공지</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li className="muted">GPS 추적으로 라이딩을 기록하세요.</li>
              <li className="muted">CO₂ 절감량에 따라 포인트를 적립합니다.</li>
              <li className="muted">실시간 데이터는 1분 간격으로 갱신됩니다.</li>
            </ul>
          </div>
          <div className="footer text-green">© Tashu, Daejeon City</div>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/rental" element={<BikeRental user={user} onUpdateUser={updateUser} />} />
            <Route path="/map" element={<Home />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/history" element={<RideHistory />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/mypage" element={<MyPage user={user} onUpdateUser={updateUser} onLogout={logout} />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
        </>
      )}

      {!user || !isAuthenticated ? (
        <main>
          <Routes>
            <Route path="/" element={<LandingPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="*" element={<LandingPage onLogin={handleLogin} />} />
          </Routes>
        </main>
      ) : null}
    </div>
  );
}

export default App;
