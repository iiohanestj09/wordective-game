import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Styles/ChooseTheme.css';

const backendUrl = 'http://localhost:5000';
const themeOrder = [
  'Prehistoric Age',
  'Classical Antiquity',
  'Medieval & Renaissance',
  'Victorian Era',
  'Contemporary Era',
  'Futuristic Space',
];
const themeColors = [
  { active: '#144224', preview: '#c1deb69c' },
  { active: '#082F63', preview: '#bcd6f387' },
  { active: '#7C082A', preview: '#dbb0bda4' },
  { active: '#4D2C0A', preview: '#c6b19db5' },
  { active: '#B85E03', preview: '#e4c7aab2' },
  { active: '#560F6B', preview: '#d2b8d9a0' },
];

function ChooseTheme() {
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [animatingThemeId, setAnimatingThemeId] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${backendUrl}/api/themes`, { signal: controller.signal })
      .then(({ data }) => {
        const orderedThemes = [...data].sort(
          (first, second) =>
            themeOrder.indexOf(first.theme_name) - themeOrder.indexOf(second.theme_name),
        );
        setThemes(orderedThemes);
        setSelectedThemeId(orderedThemes[0]?.theme_id ?? null);
      })
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setError(requestError.response?.data?.message ?? requestError.message);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isDifficultyModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDifficultyModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDifficultyModalOpen]);

  const selectedTheme = themes.find((theme) => theme.theme_id === selectedThemeId);
  const selectedThemeIndex = selectedTheme
    ? themeOrder.indexOf(selectedTheme.theme_name) + 1
    : 0;

  return (
    <div className="choose-theme-page">
      <div className="choose-theme-canvas">
        <nav className="choose-theme-navbar">
          <Link className="choose-theme-brand" to="/" aria-label="Wordective home">
            <img
              className="choose-theme-logo"
              src={`${backendUrl}/images/icons/logo.svg`}
              alt=""
            />
            <span>Wordective</span>
          </Link>
          <button className="choose-theme-nav-action" type="button">
            Lets Choose Theme
          </button>
        </nav>

        <main className="choose-theme-main">
          <h1 className="choose-theme-heading">Where you want to be.</h1>

          <div className="choose-theme-content">
            <section className="choose-theme-list" aria-label="Theme choices">
              {themes.map((theme, index) => (
                <button
                  aria-pressed={theme.theme_id === selectedThemeId}
                  className={[
                    'choose-theme-option',
                    theme.theme_id === selectedThemeId ? 'is-active' : '',
                    theme.theme_id === animatingThemeId ? 'is-animating' : '',
                  ].filter(Boolean).join(' ')}
                  key={theme.theme_id}
                  onAnimationEnd={() => {
                    if (theme.theme_id === animatingThemeId) {
                      setAnimatingThemeId(null);
                    }
                  }}
                  onClick={() => {
                    setSelectedThemeId(theme.theme_id);
                    setAnimatingThemeId(theme.theme_id);
                  }}
                  style={{ '--theme-active-color': themeColors[index]?.active ?? '#144224' }}
                  type="button"
                >
                  {`${String(index + 1).padStart(2, '0')} ${theme.theme_name}`}
                </button>
              ))}
            </section>

            <section
              aria-live="polite"
              className="choose-theme-preview"
              style={{
                backgroundColor:
                  themeColors[selectedThemeIndex - 1]?.preview ?? '#c1deb69c',
              }}
            >
              {selectedTheme ? (
                <>
                  <h2 className="choose-theme-title">{selectedTheme.theme_name}</h2>
                  <img
                    className="choose-theme-image"
                    src={`${backendUrl}/images/themes/t${selectedThemeIndex}.png`}
                    alt=""
                  />
                  <p className="choose-theme-description">{selectedTheme.description}</p>
                </>
              ) : (
                <p className="choose-theme-description">
                  {error || 'Lorem ipsum dolor sit amet.'}
                </p>
              )}
            </section>
          </div>

          <div className="choose-theme-navigation">
            <Link className="choose-theme-page-button" to="/">
              Back
            </Link>
            <button
              className="choose-theme-page-button"
              onClick={() => setIsDifficultyModalOpen(true)}
              type="button"
            >
              Next
            </button>
          </div>
        </main>

        {isDifficultyModalOpen && (
          <div
            className="choose-theme-modal-overlay"
            onClick={() => setIsDifficultyModalOpen(false)}
          >
            <section
              aria-labelledby="choose-theme-modal-title"
              aria-modal="true"
              className="choose-theme-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <button
                aria-label="Close difficulty selection"
                className="choose-theme-modal-close"
                onClick={() => setIsDifficultyModalOpen(false)}
                type="button"
              >
                ×
              </button>
              <h2 className="choose-theme-modal-title" id="choose-theme-modal-title">
                Choose Difficulty
              </h2>
              <div className="choose-theme-difficulty-options">
                {['Beginner', 'Intermediate', 'Expert'].map((difficulty) => (
                  <button
                    aria-pressed={selectedDifficulty === difficulty}
                    className={[
                      'choose-theme-difficulty-option',
                      `is-${difficulty.toLowerCase()}`,
                      selectedDifficulty === difficulty ? 'is-selected' : '',
                    ].filter(Boolean).join(' ')}
                    key={difficulty}
                    onClick={() => {
                      setSelectedDifficulty(difficulty);
                      setIsDifficultyModalOpen(false);
                    }}
                    type="button"
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChooseTheme;
