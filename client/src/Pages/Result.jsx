import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Styles/PlayGame.css';
import '../Styles/Result.css';
import { clearGameSession, readGameSession, updateGameSession } from '../utils/gameSession';
import { matchesSuspectName } from '../utils/suspectMatching';

const backendUrl = 'http://localhost:5000';

function loadResultSession() {
  try {
    const session = readGameSession();
    const validSession = session?.caseStory?.case_id != null
      && Array.isArray(session?.caseStory?.cards)
      && session.caseStory.cards.length === 7
      && session.caseStory.cards.every(
        (card) => card.card_id != null
          && typeof card.card_title === 'string'
          && typeof card.img_url === 'string',
      )
      && session.selectedSuspectCardId != null;

    if (!validSession) {
      return {
        session: null,
        error: 'Your suspect selection was not found. Please choose a suspect first.',
      };
    }

    return { session, error: '' };
  } catch (sessionError) {
    return {
      session: null,
      error: `Unable to read the game result: ${sessionError.message}`,
    };
  }
}

function CharacterResult({ card, heading, headingType, logicNotes }) {
  const imagePath = card.img_url.replace(/^\/+/, '').replace(/^images\//, '');

  return (
    <section className={`result-character-panel is-${headingType}`}>
      {heading && (
        <h2 className="result-section-heading">
          <img
            src={`${backendUrl}/images/icons/${headingType === 'correct' ? 'correct.png' : 'wrong.png'}`}
            alt=""
          />
          <span>{heading}</span>
        </h2>
      )}
      <img
        className="result-character-image"
        src={`${backendUrl}/images/${imagePath}`}
        alt=""
      />
      <h3 className="result-character-name">{card.card_title}</h3>
      {logicNotes && <p className="result-logic-notes">{logicNotes}</p>}
    </section>
  );
}

function Result() {
  const loadedSession = loadResultSession();
  const [session, setSession] = useState(loadedSession.session);
  const [error, setError] = useState(loadedSession.error);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (
      !session
      || (
        typeof session.caseStory.correct_suspect === 'string'
        && typeof session.caseStory.logic_notes === 'string'
      )
    ) {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    axios.get(`${backendUrl}/api/cases`, {
      params: {
        theme_id: session.themeId,
        difficulty: session.difficulty,
        case_id: session.caseStory.case_id,
      },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (
          typeof data.correct_suspect !== 'string'
          || typeof data.logic_notes !== 'string'
        ) {
          throw new Error('The case result data is incomplete.');
        }

        if (!isActive) {
          return;
        }

        const updatedCase = {
          ...session.caseStory,
          correct_suspect: data.correct_suspect,
          logic_notes: data.logic_notes,
        };
        updateGameSession({ caseStory: updatedCase });
        setSession((currentSession) => (
          currentSession
            ? { ...currentSession, caseStory: updatedCase }
            : currentSession
        ));
      })
      .catch((requestError) => {
        if (isActive && !axios.isCancel(requestError)) {
          setError(
            `Unable to load the correct case answer: ${requestError.response?.data?.message ?? requestError.message}`,
          );
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [session]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const selectedCard = session?.caseStory.cards.find(
    (card) => String(card.card_id) === String(session.selectedSuspectCardId),
  );
  const correctCard = typeof session?.caseStory.correct_suspect === 'string'
    ? session.caseStory.cards.find(
      (card) => matchesSuspectName(
        card.card_title,
        session.caseStory.correct_suspect,
      ),
    )
    : null;
  const hasAnswerData = typeof session?.caseStory.correct_suspect === 'string'
    && typeof session?.caseStory.logic_notes === 'string';
  const resultError = error
    || (
    hasAnswerData && (!selectedCard || !correctCard)
      ? 'The selected suspect or correct answer could not be matched to the case cards.'
      : ''
    );
  const resultReady = !resultError
    && hasAnswerData
    && selectedCard
    && correctCard
    && typeof session.caseStory.logic_notes === 'string';
  const isCorrect = resultReady
    && String(selectedCard.card_id) === String(correctCard.card_id);

  return (
    <div className="play-game-page result-page">
      <nav className="choose-theme-navbar play-game-navbar result-navbar">
        <Link className="choose-theme-brand" to="/" aria-label="Wordective home">
          <img
            className="choose-theme-logo"
            src={`${backendUrl}/images/icons/logo.svg`}
            alt=""
          />
          <span>Wordective</span>
        </Link>
        <button
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
          className="choose-theme-nav-action play-game-nav-action play-game-next-button result-menu-trigger"
          onClick={() => setIsMenuOpen(true)}
          type="button"
        >
          Menu
        </button>
      </nav>

      {resultError ? (
        <main className="play-game-error" role="alert">{resultError}</main>
      ) : !resultReady ? (
        <main className="result-status" role="status">Loading result...</main>
      ) : (
        <main className={`result-content${isCorrect ? ' is-correct' : ' is-incorrect'}`}>
          {isCorrect ? (
            <>
              <h1 className="result-main-heading is-correct">
                <img src={`${backendUrl}/images/icons/correct.png`} alt="" />
                <span>You&apos;re right!</span>
              </h1>
              <CharacterResult
                card={correctCard}
                heading=""
                headingType="correct"
                logicNotes={session.caseStory.logic_notes}
              />
            </>
          ) : (
            <div className="result-comparison">
              <CharacterResult
                card={selectedCard}
                heading="Not quite!"
                headingType="wrong"
              />
              <CharacterResult
                card={correctCard}
                heading="The Correct Answer"
                headingType="correct"
                logicNotes={session.caseStory.logic_notes}
              />
            </div>
          )}
        </main>
      )}

      {isMenuOpen && (
        <div
          className="play-game-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        >
          <section
            aria-labelledby="result-menu-title"
            aria-modal="true"
            className="play-game-menu-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close menu"
              className="play-game-menu-close"
              onClick={() => setIsMenuOpen(false)}
              type="button"
            >
              ×
            </button>
            <h2 className="play-game-menu-title" id="result-menu-title">
              Menu
            </h2>
            <div className="play-game-menu-options">
              <Link
                className="play-game-menu-option"
                onClick={() => {
                  clearGameSession();
                  setIsMenuOpen(false);
                }}
                to="/"
              >
                Back to Introduction
              </Link>
              <Link
                className="play-game-menu-option"
                onClick={() => {
                  clearGameSession();
                  setIsMenuOpen(false);
                }}
                to="/choose-theme"
              >
                Choose Case Again
              </Link>
              <button
                className="play-game-menu-option"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Result;
