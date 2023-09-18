import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    setIsCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light" >
      <Link className="navbar-brand" to="/" onClick={handleLinkClick}>
        Badmintonsentralen🏸
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        onClick={toggleNavbar}
        aria-expanded={!isCollapsed}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse ${isCollapsed ? "" : "show"}`}>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/"
              onClick={handleLinkClick}
            >
              Hjem
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/hvorfor"
              onClick={handleLinkClick}
            >
              Hvorfor
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/hvordan"
              onClick={handleLinkClick}
            >
              Hvordan
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/feedback"
              onClick={handleLinkClick}
            >
              Feedback
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
