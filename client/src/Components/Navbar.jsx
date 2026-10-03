import React from 'react';
import '../Styles/Navbar.css';

const Navbar = () => {
  const backendUrl = 'http://localhost:5000';

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => scrollToSection('intro')}>
        <div className="logo-wordective">
          <img
            src={`${backendUrl}/images/icons/logo.svg`}
            alt="Wordective"
            className="logo-wordective"
        />
        </div>
        <span className="logo-text">Wordective</span>
      </div>

      <div className="navbar-right">
        {/* Tombol Description */}
        <button 
          className="nav-button" 
          onClick={() => scrollToSection('description')}
        >
          Description
        </button>

        {/* Tombol About Us */}
        <button 
          className="nav-button about-us" 
          onClick={() => scrollToSection('about')}
        >
          About Us
        </button>

        {/* Tombol Play Game */}
        <button className="nav-button play-game">
          Play Game
        </button>
      </div>
    </nav>
  );
};

export default Navbar;