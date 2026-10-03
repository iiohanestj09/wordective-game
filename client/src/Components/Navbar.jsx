import React from 'react';
import '../Styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-placeholder"></div>
        <span className="logo-text">Wordective</span>
      </div>
      <div className="navbar-right">
        <div className="nav-button">Description</div>
        <div className="nav-button about-us">About Us</div>
        <div className="nav-button play-game">Play Game</div>
      </div>
    </nav>
  );
};

export default Navbar;