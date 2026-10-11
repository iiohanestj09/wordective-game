import { Link } from 'react-router-dom';
import '../Styles/Navbar.css';
import { readGameSession } from '../utils/gameSession';

const Navbar = () => {
  const backendUrl = 'http://localhost:5000';

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  let hasActiveGame = false;
  try {
    const session = readGameSession();
    hasActiveGame = Boolean(
      session?.caseStory
      && Array.isArray(session.caseStory.cards)
      && session.caseStory.cards.length === 7
      && Array.isArray(session.caseStory.clues)
      && session.caseStory.clues.length === 3,
    );
  } catch (sessionError) {
    console.error('Unable to read the temporary game session:', sessionError);
  }

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
        <Link className="nav-button play-game" to={hasActiveGame ? '/play-game' : '/choose-theme'}>
          Play Game
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;