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
            <Link className="nav-link" to="/search" onClick={handleLinkClick}>Sammenlign spillere</Link>
          </li>
            <Link
              className="nav-link"
              to="/"
              onClick={handleLinkClick}
            >
            </Link>
          </ul>
      </div>
    </nav>
  );
};

export default Navbar;
