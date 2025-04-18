import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    setRole(decoded.role);
    setName(decoded.firstName);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar-container">
      {location.pathname !== '/' && (
      <div className="hamburger-menu">
        <input
          type="checkbox"
          id="menu-toggle"
          checked={isMenuOpen}
          onChange={toggleMenu}
          style={{ display: 'none' }} // Hide the default checkbox
        />
        <label htmlFor="menu-toggle" className="menu-icon">
          {isMenuOpen ? 'X' : '☰'} {/* Change icon when open */}
        </label>

        {isMenuOpen && (
          <nav className="sidebar">
            <button className="hm-close-button" onClick={toggleMenu}>
              x
            </button>
            <ul>
              <li><Link to="/home" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/analysis" onClick={toggleMenu}>Analysis Tool</Link></li>
              <li><Link to="/settings" onClick={toggleMenu}>Settings</Link></li>
              <li><Link to="/users" onClick={toggleMenu}>Manage Users</Link></li>
            </ul>
          </nav>
        )}
        {/*<div className="welcome-guest">
        <h2> Welcome, {name} </h2></div>*/}
      </div>
      )}
    </div>
  );
}

export default Navbar;