import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/PlayGame.css';
import '../Styles/ChooseSuspect.css';
import { clearGameSession, readGameSession, updateGameSession } from '../utils/gameSession';

const backendUrl = 'http://localhost:5000';
const themeCardColors = {
  1: '#278046',
  2: '#0C4693',
  3: '#A30B37',
  4: '#794510',
  5: '#CF6700',
  6: '#761594',
};

function loadSuspectSession() {
  try {
    const session = readGameSession();
    const validSession = Number.isInteger(session?.themeIndex)
      && Object.hasOwn(themeCardColors, session.themeIndex)
      && Array.isArray(session?.caseStory?.cards)
      && session.caseStory.cards.length === 7
      && session.caseStory.cards.every(
        (card) => card.card_id != null
          && typeof card.card_title === 'string'
          && typeof card.img_url === 'string',
      );

    if (!validSession) {
      return {
        session: null,
        error: 'Game session not found. Please complete the case setup first.',
      };
    }

    return { session, error: '' };
  } catch (sessionError) {
    return {
      session: null,
      error: `Unable to read the temporary game session: ${sessionError.message}`,
    };
  }
}

function ChooseSuspect() {
  const navigate = useNavigate();
  const loadedSession = loadSuspectSession();
  const [session, setSession] = useState(loadedSession.session);
  const [selectedCard, setSelectedCard] = useState(null);
  const [suspectReason, setSuspectReason] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notes, setNotes] = useState(() => loadedSession.session?.notes ?? '');
  const error = loadedSession.error;
  const [notesSaveError, setNotesSaveError] = useState('');
  const [selectionSaveError, setSelectionSaveError] = useState('');
  const cardColor = themeCardColors[session?.themeIndex];
  const selectedSuspectCardId = session?.selectedSuspectCardId == null
    ? null
    : String(session.selectedSuspectCardId);
  const suspectReasonWordCount = suspectReason.trim()
    ? suspectReason.trim().split(/\s+/).length
    : 0;
  const hasValidSuspectReason = suspectReasonWordCount >= 10;

  useEffect(() => {
    if (!isNotesOpen && !isMenuOpen && !selectedCard) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNotesOpen(false);
        setIsMenuOpen(false);
        setSelectedCard(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotesOpen, isMenuOpen, selectedCard]);

  const handleNotesChange = (event) => {
    const updatedNotes = event.target.value;
    setNotes(updatedNotes);
    try {
      updateGameSession({ notes: updatedNotes });
      setNotesSaveError('');
    } catch (sessionError) {
      setNotesSaveError(`Unable to save notes to this game session: ${sessionError.message}`);
    }
  };

  const handleConfirmSuspect = () => {
    if (!hasValidSuspectReason) {
      return;
    }

    try {
      const updatedSession = {
        ...session,
        selectedSuspectCardId: String(selectedCard.card_id),
        selectedSuspectName: selectedCard.card_title.split(',')[0].trim(),
      };
      updateGameSession({
        selectedSuspectCardId: updatedSession.selectedSuspectCardId,
        selectedSuspectName: updatedSession.selectedSuspectName,
      });
      setSession(updatedSession);
      setSelectionSaveError('');
      setSelectedCard(null);
      navigate('/result');
    } catch (sessionError) {
      setSelectionSaveError(`Unable to save your suspect selection: ${sessionError.message}`);
    }
  };

  return (
    <div className="play-game-page choose-suspect-page">
      <nav className="choose-theme-navbar play-game-navbar">
        <Link className="choose-theme-brand" to="/" aria-label="Wordective home">
          <img
            className="choose-theme-logo"
            src={`${backendUrl}/images/icons/logo.svg`}
            alt=""
          />
          <span>Wordective</span>
        </Link>
      </nav>

      {error ? (
        <main className="play-game-error" role="alert">{error}</main>
      ) : (
        <main
          className="play-game-board choose-suspect-board"
          style={{ '--play-game-card-color': cardColor }}
        >
          <h1 className="choose-suspect-heading">Choose A Suspect</h1>
          {selectionSaveError && (
            <p className="play-game-vocabulary-status" role="alert">
              {selectionSaveError}
            </p>
          )}
          <aside className="play-game-left-rail">
            <button
              aria-label="Open notes"
              className="play-game-notes-trigger"
              onClick={() => setIsNotesOpen(true)}
              type="button"
            >
              <img
                className="play-game-notes"
                src={`${backendUrl}/images/icons/notes.png`}
                alt=""
              />
            </button>
            <button
              aria-label="Open menu"
              className="play-game-menu"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <img src={`${backendUrl}/images/icons/Gear.png`} alt="" />
              <span>Menu</span>
            </button>
          </aside>

          <section className="play-game-cards choose-suspect-cards" aria-label="Choose one suspect">
            {[0, 1].map((rowIndex) => {
              const firstCardIndex = rowIndex === 0 ? 0 : 4;
              const rowCardCount = rowIndex === 0 ? 4 : 3;

              return (
                <div
                  className={`play-game-card-row${rowIndex === 1 ? ' is-short' : ''}`}
                  key={rowIndex}
                >
                  {session.caseStory.cards
                    .slice(firstCardIndex, firstCardIndex + rowCardCount)
                    .map((card) => {
                      const cardId = String(card.card_id);
                      const imagePath = card.img_url.replace(/^\/+/, '').replace(/^images\//, '');
                      const isHintCard = session.hints?.npcCardIds?.includes(cardId) ?? false;
                      const isSelected = selectedSuspectCardId === cardId;

                      return (
                        <button
                          aria-pressed={isSelected}
                          aria-label={`Choose ${card.card_title.split(',')[0].trim()} as suspect`}
                          className={[
                            'play-game-npc-card',
                            'choose-suspect-card',
                            isHintCard ? 'is-hint-target' : '',
                            isSelected ? 'is-selected' : '',
                          ].filter(Boolean).join(' ')}
                          key={cardId}
                          onClick={() => {
                            setSelectionSaveError('');
                            setSuspectReason('');
                            setSelectedCard(card);
                          }}
                          type="button"
                        >
                          <span className={`play-game-npc-card-face${isHintCard ? ' play-game-npc-card-hint-face' : ''}`}>
                            <img
                              src={`${backendUrl}/images/${imagePath}`}
                              alt=""
                            />
                            <span>{card.card_title}</span>
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </section>
        </main>
      )}

      {isNotesOpen && (
        <div
          className="play-game-notes-overlay"
          onClick={() => setIsNotesOpen(false)}
        >
          <section
            aria-labelledby="play-game-notes-title"
            aria-modal="true"
            className="play-game-notes-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close notes"
              className="play-game-notes-close"
              onClick={() => setIsNotesOpen(false)}
              type="button"
            >
              ×
            </button>
            <h2 className="play-game-notes-title" id="play-game-notes-title">
              Notes
            </h2>
            <label className="play-game-notes-label" htmlFor="choose-suspect-notes-input">
              Your investigation notes
            </label>
            <textarea
              autoFocus
              className="play-game-notes-input"
              id="choose-suspect-notes-input"
              onChange={handleNotesChange}
              placeholder="Write down the information you discover..."
              value={notes}
            />
            {notesSaveError && (
              <p className="play-game-notes-error" role="alert">{notesSaveError}</p>
            )}
          </section>
        </div>
      )}

      {isMenuOpen && (
        <div
          className="play-game-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        >
          <section
            aria-labelledby="play-game-menu-title"
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
            <h2 className="play-game-menu-title" id="play-game-menu-title">
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
                Choose Case
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

      {selectedCard && (
        <div
          className="play-game-npc-modal-overlay choose-suspect-confirm-overlay"
          onClick={() => setSelectedCard(null)}
        >
          <section
            aria-labelledby="choose-suspect-confirm-title"
            aria-modal="true"
            className="play-game-menu-modal choose-suspect-confirmation"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close suspect confirmation"
              className="play-game-menu-close"
              onClick={() => {
                setSelectedCard(null);
                setSuspectReason('');
              }}
              type="button"
            >
              ×
            </button>
            <h2 className="play-game-menu-title" id="choose-suspect-confirm-title">
                Why did you choose {selectedCard.card_title.split(',')[0].trim()} as the suspect?
              </h2>
              <img
                className="choose-suspect-confirm-image"
                src={`${backendUrl}/images/${selectedCard.img_url.replace(/^\/+/, '').replace(/^images\//, '')}`}
                alt=""
              />
              <label
                className="choose-suspect-reason-label"
                htmlFor="choose-suspect-reason"
              >
                Your reason
              </label>
              <textarea
                className="choose-suspect-reason"
                id="choose-suspect-reason"
                onChange={(event) => setSuspectReason(event.target.value)}
                placeholder={
                  hasValidSuspectReason
                    ? 'Write your reason...'
                    : 'Please enter a reason with at least 10 words'
                }
                value={suspectReason}
              />
              <div className="choose-suspect-confirm-actions">
                <button
                  className="play-game-menu-option"
                  onClick={() => {
                    setSelectedCard(null);
                    setSuspectReason('');
                  }}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="play-game-menu-option"
                  disabled={!hasValidSuspectReason}
                  onClick={handleConfirmSuspect}
                  type="button"
                >
                  Next
                </button>
              </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ChooseSuspect;
