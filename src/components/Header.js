import React from "react";
import { Link, NavLink } from "react-router-dom";

function Header({ title, user, onLogout }) {
  return (
    <header style={{
      height: "60px",
      background: "linear-gradient(135deg, #16a34a, #22c55e)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      fontSize: "18px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/map" style={{ color: "white", textDecoration: "none" }}>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}>
            타슈
          </div>
        </Link>
        <nav style={{ display: "flex", gap: "20px" }}>
          <NavLink 
            to="/usage"
            style={({ isActive }) => ({ 
              color: "white", 
              textDecoration: isActive ? "underline" : "none", 
              fontSize: "14px", 
              opacity: isActive ? 1 : 0.9 
            })}
          >
            이용방법
          </NavLink>
          <NavLink 
            to="/about"
            style={({ isActive }) => ({ 
              color: "white", 
              textDecoration: isActive ? "underline" : "none", 
              fontSize: "14px", 
              opacity: isActive ? 1 : 0.9 
            })}
          >
            서비스 안내
          </NavLink>
          <NavLink 
            to="/stations"
            style={({ isActive }) => ({ 
              color: "white", 
              textDecoration: isActive ? "underline" : "none", 
              fontSize: "14px", 
              opacity: isActive ? 1 : 0.9 
            })}
          >
            대여소 조회
          </NavLink>
          <NavLink 
            to="/notice"
            style={({ isActive }) => ({ 
              color: "white", 
              textDecoration: isActive ? "underline" : "none", 
              fontSize: "14px", 
              opacity: isActive ? 1 : 0.9 
            })}
          >
            고객센터
          </NavLink>
        </nav>
      </div>
      
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "14px", opacity: 0.9 }}>
            {user.name}님 안녕하세요
          </span>
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
