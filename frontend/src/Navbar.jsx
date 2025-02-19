import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="hamburger-menu">
      <input
        type="checkbox"
        id="menu-toggle"
        checked={isMenuOpen}
        onChange={toggleMenu}
      />
      <label htmlFor="menu-toggle" className="menu-icon">&#9776;</label>

      {isMenuOpen && (
        <nav className="sidebar">
          <ul>
            <li><Link to="/home" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/analysis" onClick={toggleMenu}>Analysis Tool</Link></li>
            <li><Link to="/settings" onClick={toggleMenu}>Settings</Link></li>
            <li><Link to="/users" onClick={toggleMenu}>Users</Link></li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Navbar;