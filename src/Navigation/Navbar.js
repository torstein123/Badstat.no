import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthenticationContext } from "../Auth-Context.js"; // Adjust this import path to where your AuthenticationContext is located
import "./Navbar.scss"; // Ensure this path matches your styling file

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isAuthenticated, onLogout } = useContext(AuthenticationContext);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const handleLinkClick = () => setIsCollapsed(true);
  const handleLogoutClick = async () => {
    await onLogout();
    handleLinkClick(); // Optionally collapse the navbar on logout
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={handleLinkClick}>
          <h1>BadStat Norge</h1>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isCollapsed ? "" : "show"}`} id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/headtohead" onClick={handleLinkClick}>
                <h3>Head to Head</h3>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/PlayerList" onClick={handleLinkClick}>
                <h3>Spillersøk</h3>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Diary" onClick={handleLinkClick}>
                <h3>BadmintonDagbok</h3>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="https://www.paypal.com/donate/?hosted_button_id=7DR5WBGT9QL5A" onClick={handleLinkClick}>
                <h3>Buy me a coffee</h3>
              </Link>
            </li>
            {isAuthenticated ? (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={handleLogoutClick}
                  style={{ background: "none", border: "none", padding:5, color: "#ffe4ff" }}
                >
                  <h3>Logg ut</h3>
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/account" onClick={handleLinkClick}>
                  <h3>Logg inn / Registrer</h3>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
