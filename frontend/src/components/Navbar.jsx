import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaCaretDown, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const [showLoginChoice, setShowLoginChoice] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/v1/user/patient/logout", {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setIsAuthenticated(false);
      navigateTo("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const handleLoginClick = () => {
    setShowLoginChoice(true);
  };

  const chooseLogin = (type) => {
    setShowLoginChoice(false);
    if (type === "user") navigateTo("/login");
    if (type === "admin") {
      window.location.href = "http://localhost:5174/";
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="container navbar">
        <div className="logo">
          <Link to="/" onClick={() => setShow(false)}>
            <img src="/logo.png" alt="logo" className="logo-img" />
          </Link>
        </div>

        <div className={`navLinks ${show ? "showmenu" : ""}`}>
          <div className="links">
            <Link to="/" onClick={() => setShow(false)}>Home</Link>
            <Link to="/appointment" onClick={() => setShow(false)}>Appointment</Link>
            <Link to="/about" onClick={() => setShow(false)}>About Us</Link>
          </div>

          <div className="auth-buttons" ref={dropdownRef}>
            {isAuthenticated ? (
              <div className="profile-dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="profile-icon-button"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  title="Profile menu"
                >
                  <FaUserCircle size={26} />
                  <FaCaretDown style={{ marginLeft: "4px", fontSize: "0.7rem" }} />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShow(false);
                        navigateTo("/dashboard");
                      }}
                    >
                      My Profile
                    </button>
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="loginBtn btn" onClick={handleLoginClick}>LOGIN</button>
            )}
          </div>
        </div>

        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>

      {showLoginChoice && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(30,42,73,0.25)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2.5rem 2rem 1.5rem 2rem",
              borderRadius: 18,
              minWidth: 320,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              textAlign: "center",
              border: "1.5px solid #e3e7ee",
              transition: "all 0.2s",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#20385b",
                fontWeight: 700,
                fontSize: "1.7rem",
                letterSpacing: 1,
              }}
            >
              Select Login Type
            </h2>
            <div
              style={{
                display: "flex",
                gap: 28,
                margin: "32px 0 22px 0",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  padding: "12px 38px",
                  minWidth: 110,
                  background: "#2C3E50",
                  borderRadius: 8,
                  border: "none",
                  color: "#fff",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 1px 6px rgba(80,110,255,0.09)",
                  transition: "background 0.2s",
                }}
                onClick={() => chooseLogin("user")}
              >
                User
              </button>
              <button
                style={{
                  padding: "12px 38px",
                  minWidth: 110,
                  background: "#E74C3C",
                  borderRadius: 8,
                  border: "none",
                  color: "#fff",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 1px 6px rgba(156,13,70,0.09)",
                  transition: "background 0.2s",
                }}
                onClick={() => chooseLogin("admin")}
              >
                Admin
              </button>
            </div>
            <button
              onClick={() => setShowLoginChoice(false)}
              style={{
                background: "#fff",
                color: "#666",
                border: "1px solid #dedede",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(31,38,135,0.08)",
                padding: "8px 34px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "1.05rem",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
