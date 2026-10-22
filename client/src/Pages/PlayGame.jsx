import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/PlayGame.css';
import {
  clearGameSession,
  readGameSession,
  updateGameSession,
} from '../utils/gameSession';

const backendUrl = 'http://localhost:5000';
const themeCardColors = {
  1: '#278046',
  2: '#0C4693',
  3: '#A30B37',
  4: '#794510',
  5: '#CF6700',
  6: '#761594',
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickRandomCards(cards, count) {
  const shuffledCards = [...cards];
  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ];
  }
  return shuffledCards.slice(0, count).map((card) => String(card.card_id));
}

function VocabularyText({
  text,
  vocabularies = [],
  onVocabularyClick,
  activeTokenId,
  tokenScope,
}) {
  const vocabularyByWord = new Map(
    vocabularies.map((vocabulary) => [vocabulary.word.toLowerCase(), vocabulary]),
  );
  const words = [...vocabularyByWord.keys()]
    .sort((first, second) => second.length - first.length)
    .map(escapeRegExp);

  if (words.length === 0) {
    return text;
  }

  const matcher = new RegExp(
    `(^|[^A-Za-z0-9])(${words.join('|')})(?=$|[^A-Za-z0-9])`,
    'gi',
  );
  const parts = [];
  let cursor = 0;
  let match = matcher.exec(text);

  while (match) {
    const wordStart = match.index + match[1].length;
    const wordEnd = wordStart + match[2].length;
    if (wordStart >= cursor) {
      if (wordStart > cursor) {
        parts.push(text.slice(cursor, wordStart));
      }
      const matchedWord = match[2];
      const tokenId = `${tokenScope}-${wordStart}`;
      const vocabulary = vocabularyByWord.get(matchedWord.toLowerCase());
      parts.push(
        <button
          aria-label={`Show translation for ${matchedWord}`}
          className={`play-game-vocabulary-word${activeTokenId === tokenId ? ' is-active' : ''}`}
          data-vocabulary-token-id={tokenId}
          key={`${wordStart}-${wordEnd}`}
          onClick={(event) => onVocabularyClick(
            event,
            matchedWord,
            vocabulary.meaning,
            tokenId,
          )}
          type="button"
        >
          {matchedWord}
        </button>,
      );
      cursor = wordEnd;
    }
    match = matcher.exec(text);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function loadGameSession() {
  try {
    const session = readGameSession();
    const validThemeIndex = Number.isInteger(session?.themeIndex)
      && Object.hasOwn(themeCardColors, session.themeIndex);
    const validCase = typeof session?.caseStory?.case_title === 'string'
      && typeof session?.caseStory?.story === 'string'
      && Array.isArray(session?.caseStory?.cards)
      && session.caseStory.cards.length === 7
      && session.caseStory.cards.every(
        (card) => typeof card.card_title === 'string'
          && typeof card.content === 'string'
          && typeof card.img_url === 'string',
      )
      && Array.isArray(session?.caseStory?.clues)
      && session.caseStory.clues.length === 3
      && session.caseStory.clues.every(
        (clue) => typeof clue.card_title === 'string'
          && typeof clue.content === 'string'
          && typeof clue.img_url === 'string',
      );

    if (!validThemeIndex || !validCase) {
      return {
        session: null,
        error: 'Game session not found. Please choose a theme and difficulty, then open a story first.',
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

function PlayGame() {
  const navigate = useNavigate();
  const loadedSession = loadGameSession();
  const [session, setSession] = useState(loadedSession.session);
  const { error } = loadedSession;
  const themeIndex = session?.themeIndex;
  const cardColor = themeCardColors[themeIndex];
  const clueCount = session?.caseStory?.clues.length ?? 0;
  const hintDataReady = Boolean(
    session?.caseStory
    && [...session.caseStory.cards, ...session.caseStory.clues].every(
      (card) => typeof card.main_idea === 'string',
    ),
  );
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [progressSaveError, setProgressSaveError] = useState('');
  const [flippedClueCount, setFlippedClueCount] = useState(0);
  const [openCardIds, setOpenCardIds] = useState(() => new Set());
  const [readNpcCardIds, setReadNpcCardIds] = useState(
    () => new Set(
      Array.isArray(session?.readNpcCardIds)
        ? session.readNpcCardIds.map(String)
        : [],
    ),
  );
  const [cluesViewed, setCluesViewed] = useState(
    () => session?.cluesViewed === true,
  );
  const [hints, setHints] = useState(() => session?.hints ?? {
    used: false,
    npcCardIds: [],
    clueCardIds: [],
  });
  const [hintsError, setHintsError] = useState('');
  const [selectedNpcCard, setSelectedNpcCard] = useState(null);
  const [vocabularyPopup, setVocabularyPopup] = useState(null);
  const vocabularyPopupRef = useRef(null);
  const vocabularyPopupId = useRef(0);
  const [vocabularyLoadError, setVocabularyLoadError] = useState('');
  const [notes, setNotes] = useState(() => session?.notes ?? '');
  const [notesSaveError, setNotesSaveError] = useState('');
  const requiredNpcCardIds = hints.used
    ? new Set(hints.npcCardIds.map(String))
    : new Set(session?.caseStory.cards.map((card) => String(card.card_id)) ?? []);
  const hasUnreadRequiredNpcCards = [...requiredNpcCardIds]
    .some((cardId) => !readNpcCardIds.has(cardId));

  useEffect(() => {
    const currentSession = readGameSession();
    const savedCase = currentSession?.caseStory;
    if (
      !currentSession
      || !Array.isArray(savedCase?.cards)
      || !Array.isArray(savedCase?.clues)
      || (
        [...savedCase.cards, ...savedCase.clues]
          .every(
            (card) => Array.isArray(card.vocabularies)
              && typeof card.main_idea === 'string',
          )
        && typeof savedCase.correct_suspect === 'string'
        && typeof savedCase.logic_notes === 'string'
      )
    ) {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;
    const refreshCardVocabularies = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/cases`, {
          params: {
            theme_id: currentSession.themeId,
            difficulty: currentSession.difficulty,
            case_id: savedCase.case_id,
          },
          signal: controller.signal,
        });
        const orderCards = (savedCards, refreshedCards) => {
          const refreshedById = new Map(
            refreshedCards.map((card) => [String(card.card_id), card]),
          );
          const orderedCards = savedCards
            .map((card) => refreshedById.get(String(card.card_id)))
            .filter(Boolean);

          if (
            orderedCards.length !== refreshedCards.length
            || orderedCards.some(
              (card) => !Array.isArray(card.vocabularies)
                || typeof card.main_idea !== 'string',
            )
          ) {
            throw new Error('The case API returned incomplete card hint data.');
          }
          return orderedCards;
        };
        const refreshedCase = {
          ...data,
          cards: orderCards(savedCase.cards, data.cards),
          clues: orderCards(savedCase.clues, data.clues),
        };

        if (isActive) {
          updateGameSession({ caseStory: refreshedCase });
          setSession((currentSessionState) => (
            currentSessionState
              ? { ...currentSessionState, caseStory: refreshedCase }
              : currentSessionState
          ));
        }
      } catch (requestError) {
        if (isActive && !axios.isCancel(requestError)) {
          setVocabularyLoadError(
            `Unable to load card vocabulary: ${requestError.response?.data?.message ?? requestError.message}`,
          );
        }
      }
    };

    refreshCardVocabularies();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (
      !isNotesOpen
      && !isMenuOpen
      && !isCluesOpen
      && !isRequirementsOpen
      && !selectedNpcCard
      && !vocabularyPopup
    ) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNotesOpen(false);
        setIsMenuOpen(false);
        setIsCluesOpen(false);
        setIsRequirementsOpen(false);
        setFlippedClueCount(0);
        setSelectedNpcCard(null);
        setVocabularyPopup(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isNotesOpen,
    isMenuOpen,
    isCluesOpen,
    isRequirementsOpen,
    selectedNpcCard,
    vocabularyPopup,
  ]);

  useEffect(() => {
    if (!vocabularyPopup) {
      return undefined;
    }

    const handleOutsidePointerDown = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (
        event.target.closest('.play-game-vocabulary-popup')
        || event.target.closest('.play-game-vocabulary-word')
      ) {
        return;
      }

      setVocabularyPopup(null);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
    };
  }, [vocabularyPopup]);

  useLayoutEffect(() => {
    const popup = vocabularyPopupRef.current;
    if (!popup || !vocabularyPopup || vocabularyPopup.position) {
      return;
    }

    const { width, height } = popup.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const margin = 12;
    const left = Math.min(
      Math.max(
        vocabularyPopup.anchor.left
          + (vocabularyPopup.anchor.width - width) / 2,
        margin,
      ),
      viewportWidth - width - margin,
    );
    const aboveTop = vocabularyPopup.anchor.top - height - 1;
    const top = aboveTop >= margin
      ? aboveTop
      : Math.min(
        vocabularyPopup.anchor.bottom + 1,
        window.innerHeight - height - margin,
      );

    setVocabularyPopup((currentPopup) => (
      currentPopup?.id === vocabularyPopup.id
        ? { ...currentPopup, position: { left, top } }
        : currentPopup
    ));
  }, [vocabularyPopup]);

  const handleVocabularyClick = (event, word, meaning, tokenId) => {
    if (vocabularyPopup?.tokenId === tokenId) {
      setVocabularyPopup(null);
      return;
    }

    const anchor = event.currentTarget.getBoundingClientRect();
    vocabularyPopupId.current += 1;
    setVocabularyPopup({
      id: vocabularyPopupId.current,
      word,
      meaning,
      tokenId,
      anchor: {
        top: anchor.top,
        bottom: anchor.bottom,
        left: anchor.left,
        width: anchor.width,
      },
      position: null,
    });
  };

  const closeNpcModal = () => {
    setSelectedNpcCard(null);
    setVocabularyPopup(null);
  };

  const closeCluesModal = () => {
    setIsCluesOpen(false);
    setFlippedClueCount(0);
    setVocabularyPopup(null);
  };

  const handleChooseSuspect = () => {
    if (!session) {
      return;
    }

    const missingRequirements = [];
    if (hasUnreadRequiredNpcCards) {
      missingRequirements.push('npc');
    }
    if (!cluesViewed) {
      missingRequirements.push('clues');
    }

    if (missingRequirements.length > 0) {
      setVocabularyPopup(null);
      setIsRequirementsOpen(true);
      return;
    }

    navigate('/choose-suspect');
  };

  const handleNpcCardClick = (card, cardId, isCardOpen) => {
    if (!isCardOpen) {
      setOpenCardIds((currentOpenCardIds) => (
        new Set(currentOpenCardIds).add(cardId)
      ));
      return;
    }

    try {
      const nextReadNpcCardIds = new Set(readNpcCardIds).add(cardId);
      updateGameSession({ readNpcCardIds: [...nextReadNpcCardIds] });
      setReadNpcCardIds(nextReadNpcCardIds);
      setProgressSaveError('');
    } catch (sessionError) {
      setProgressSaveError(
        `Unable to save NPC reading progress: ${sessionError.message}`,
      );
    }

    setSelectedNpcCard(card);
  };

  const handleOpenClues = () => {
    setVocabularyPopup(null);
    setFlippedClueCount(0);
    setIsCluesOpen(true);
    try {
      updateGameSession({ cluesViewed: true });
      setCluesViewed(true);
      setProgressSaveError('');
    } catch (sessionError) {
      setProgressSaveError(
        `Unable to save clue reading progress: ${sessionError.message}`,
      );
    }
  };

  const handleUseHints = () => {
    if (hints.used) {
      return;
    }

    const difficultyHintCounts = {
      beginner: { npc: 5, clue: 3 },
      intermediate: { npc: 4, clue: 2 },
      expert: { npc: 3, clue: 1 },
    };
    const hintCounts = difficultyHintCounts[String(session.difficulty).toLowerCase()];

    if (!hintCounts) {
      setHintsError(`Hints are not configured for difficulty "${session.difficulty}".`);
      return;
    }

    const nextHints = {
      used: true,
      npcCardIds: pickRandomCards(session.caseStory.cards, hintCounts.npc),
      clueCardIds: pickRandomCards(session.caseStory.clues, hintCounts.clue),
    };

    try {
      updateGameSession({ hints: nextHints });
      setSession((currentSession) => (
        currentSession ? { ...currentSession, hints: nextHints } : currentSession
      ));
      setHints(nextHints);
      const hintedNpcCardIds = new Set(nextHints.npcCardIds);
      setOpenCardIds((currentOpenCardIds) => new Set(
        [...currentOpenCardIds].filter((cardId) => !hintedNpcCardIds.has(cardId)),
      ));
      setHintsError('');
    } catch (sessionError) {
      setHintsError(`Unable to save the one-time hints for this game session: ${sessionError.message}`);
    }
  };

  useEffect(() => {
    if (!isCluesOpen) {
      return undefined;
    }

    const timers = Array.from({ length: clueCount }, (_, index) => (
      window.setTimeout(
        () => setFlippedClueCount(index + 1),
        150 + index * 180,
      )
    ));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isCluesOpen, clueCount]);

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

  return (
    <div className="play-game-page">
      <nav className="choose-theme-navbar play-game-navbar">
        <Link className="choose-theme-brand" to="/" aria-label="Wordective home">
          <img
            className="choose-theme-logo"
            src={`${backendUrl}/images/icons/logo.svg`}
            alt=""
          />
          <span>Wordective</span>
        </Link>
        <button
          className="choose-theme-nav-action play-game-nav-action play-game-next-button"
          onClick={handleChooseSuspect}
          type="button"
        >
          Choose A Suspect
        </button>
      </nav>

      {error ? (
        <main className="play-game-error" role="alert">{error}</main>
      ) : (
        <main
          className="play-game-board"
          style={{ '--play-game-card-color': cardColor }}
        >
          {vocabularyLoadError && (
            <p className="play-game-vocabulary-status" role="alert">
              {vocabularyLoadError}
            </p>
          )}
          {progressSaveError && (
            <p className="play-game-vocabulary-status" role="alert">
              {progressSaveError}
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

          <section className="play-game-cards" aria-label="Seven NPC cards">
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
                      const isCardOpen = openCardIds.has(cardId);
                      const isHintCard = hints.npcCardIds.includes(cardId);
                      const imagePath = card.img_url.replace(/^\/+/, '').replace(/^images\//, '');

                      return (
                        <button
                          aria-expanded={isCardOpen}
                          aria-label={`${card.card_title}, ${isCardOpen ? 'card open' : 'open card'}`}
                          className={[
                            'play-game-npc-card',
                            isCardOpen ? 'is-open' : '',
                            isHintCard ? 'is-hint-target' : '',
                          ].filter(Boolean).join(' ')}
                          key={cardId}
                          onClick={() => handleNpcCardClick(card, cardId, isCardOpen)}
                          type="button"
                        >
                          <span
                            className={[
                              'play-game-npc-card-hint-rotation',
                              isHintCard ? 'is-active' : '',
                              isHintCard && isCardOpen ? 'is-open' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            <span className={`play-game-npc-card-inner${!isHintCard && isCardOpen ? ' is-open' : ''}`}>
                              <span className="play-game-npc-card-back">
                                <img
                                  src={`${backendUrl}/images/icons/logo.svg`}
                                  alt=""
                                />
                              </span>
                              <span className="play-game-npc-card-face">
                                <img
                                  src={`${backendUrl}/images/${imagePath}`}
                                  alt=""
                                />
                                <span>{card.card_title}</span>
                              </span>
                            </span>
                            {isHintCard && (
                              <>
                                <span aria-hidden="true" className="play-game-npc-card-hint-back">
                                  <img src={`${backendUrl}/images/icons/star.png`} alt="" />
                                </span>
                                <span aria-hidden="true" className="play-game-npc-card-face play-game-npc-card-hint-face">
                                  <img src={`${backendUrl}/images/${imagePath}`} alt="" />
                                  <span>{card.card_title}</span>
                                </span>
                              </>
                            )}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </section>

          <aside className="play-game-right-rail">
            <button
              aria-label={hints.used ? 'Hints already used' : 'Use hints'}
              className={`play-game-hints-card${hints.used ? ' is-used' : ''}`}
              disabled={hints.used || !hintDataReady}
              onClick={handleUseHints}
              type="button"
            >
              <img src={`${backendUrl}/images/icons/star.png`} alt="" />
              <span>Use Hints</span>
            </button>
            {hintsError && <p className="play-game-hints-error" role="alert">{hintsError}</p>}
            <button
              aria-label="Reveal clues"
              className="play-game-clue-stack"
              onClick={handleOpenClues}
              type="button"
            >
              <span className="play-game-clue-layer play-game-clue-layer-back" />
              <span className="play-game-clue-layer play-game-clue-layer-middle" />
              <div className="play-game-clue-card">
                <img src={`${backendUrl}/images/icons/clover.png`} alt="" />
                <span>Clue</span>
              </div>
            </button>
          </aside>
        </main>
      )}
      {isRequirementsOpen && (
        <div
          className="play-game-menu-overlay"
          onClick={() => setIsRequirementsOpen(false)}
        >
          <section
            aria-labelledby="play-game-requirements-title"
            aria-modal="true"
            className="play-game-menu-modal play-game-requirements-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close requirements"
              className="play-game-menu-close"
              onClick={() => setIsRequirementsOpen(false)}
              type="button"
            >
              ×
            </button>
            <h2 className="play-game-menu-title" id="play-game-requirements-title">
              Before Choosing a Suspect
            </h2>
            <div className="play-game-requirements-list">
              {hasUnreadRequiredNpcCards && (
                <p>
                  {hints.used
                    ? 'Open and Read all NPC cards with hints before choosing a suspect.'
                    : 'Open and Read all NPC cards before choosing a suspect.'}
                </p>
              )}
              {!cluesViewed && (
                <p>Open the clues and review them before choosing a suspect.</p>
              )}
            </div>
            <button
              className="play-game-menu-option"
              onClick={() => setIsRequirementsOpen(false)}
              type="button"
            >
              Continue Reading
            </button>
          </section>
        </div>
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
            <label className="play-game-notes-label" htmlFor="play-game-notes-input">
              Your investigation notes
            </label>
            <textarea
              autoFocus
              className="play-game-notes-input"
              id="play-game-notes-input"
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
      {selectedNpcCard && (
        <div
          className="play-game-npc-modal-overlay"
          onClick={closeNpcModal}
        >
          <div
            className={[
              'play-game-npc-modal-group',
              hints.npcCardIds.includes(String(selectedNpcCard.card_id)) ? 'has-main-idea' : '',
            ].filter(Boolean).join(' ')}
            onClick={(event) => event.stopPropagation()}
          >
            <section
              aria-labelledby="play-game-npc-modal-name"
              aria-modal="true"
              className="play-game-npc-modal"
              role="dialog"
            >
              <button
                aria-label="Close NPC details"
                className="play-game-npc-modal-close"
                onClick={closeNpcModal}
                type="button"
              >
                ×
              </button>
              <img
                className="play-game-npc-modal-image"
                src={`${backendUrl}/images/${selectedNpcCard.img_url.replace(/^\/+/, '').replace(/^images\//, '')}`}
                alt=""
              />
              <h2 className="play-game-npc-modal-name" id="play-game-npc-modal-name">
                {selectedNpcCard.card_title.split(',')[0].trim()}
              </h2>
              {selectedNpcCard.card_title.includes(',') && (
                <p className="play-game-npc-modal-role">
                  {selectedNpcCard.card_title.slice(selectedNpcCard.card_title.indexOf(',') + 1).trim()}
                </p>
              )}
              <p className="play-game-npc-modal-content">
                <VocabularyText
                  onVocabularyClick={handleVocabularyClick}
                  text={selectedNpcCard.content}
                  vocabularies={selectedNpcCard.vocabularies}
                  activeTokenId={vocabularyPopup?.tokenId}
                  tokenScope={selectedNpcCard.card_id}
                />
              </p>
            </section>
            {hints.npcCardIds.includes(String(selectedNpcCard.card_id)) && (
              <aside aria-label="Main idea hint" className="play-game-main-idea-modal">
                <h2>Main Idea</h2>
                <p>{selectedNpcCard.main_idea}</p>
              </aside>
            )}
          </div>
        </div>
      )}
      {isCluesOpen && (
        <div
          className="play-game-clues-overlay"
          style={{ '--play-game-card-color': cardColor }}
          onClick={closeCluesModal}
        >
          <section
            aria-label="Three clues"
            aria-modal="true"
            className="play-game-clues-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="play-game-clues-row">
              {session.caseStory.clues.map((clue, index) => {
                const imagePath = clue.img_url.replace(/^\/+/, '').replace(/^images\//, '');
                const isClueFlipped = index < flippedClueCount;
                const isHintClue = hints.clueCardIds.includes(String(clue.card_id));

                return (
                  <div className="play-game-clue-item" key={clue.card_id}>
                    <article
                      aria-label={clue.card_title}
                      className={`play-game-clue-reveal-card${isClueFlipped ? ' is-flipped' : ''}`}
                    >
                      <div className="play-game-clue-reveal-inner">
                        <div className="play-game-clue-reveal-back">
                          <button
                            aria-label="Close all clues"
                            className="play-game-clue-close is-back"
                            onClick={closeCluesModal}
                            type="button"
                          >
                            ×
                          </button>
                          <img src={`${backendUrl}/images/icons/clover.png`} alt="" />
                          <span>Clue</span>
                        </div>
                        <div className={`play-game-clue-reveal-face${isHintClue ? ' has-main-idea' : ''}`}>
                          <button
                            aria-label="Close all clues"
                            className="play-game-clue-close"
                            onClick={closeCluesModal}
                            type="button"
                          >
                            ×
                          </button>
                          <img src={`${backendUrl}/images/${imagePath}`} alt="" />
                          <h2>
                            {clue.card_title}
                          </h2>
                          <p>
                            <VocabularyText
                              onVocabularyClick={handleVocabularyClick}
                              text={clue.content}
                              vocabularies={clue.vocabularies}
                              activeTokenId={vocabularyPopup?.tokenId}
                              tokenScope={clue.card_id}
                            />
                          </p>
                          {isHintClue && (
                            <p className="play-game-clue-main-idea">
                              {clue.main_idea}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
      {vocabularyPopup && createPortal(
        <section
          aria-label={`Translation for ${vocabularyPopup.word}`}
          className="play-game-vocabulary-popup"
          onClick={() => setVocabularyPopup(null)}
          ref={vocabularyPopupRef}
          role="dialog"
          style={vocabularyPopup.position
            ? {
              left: `${vocabularyPopup.position.left}px`,
              top: `${vocabularyPopup.position.top}px`,
              visibility: 'visible',
            }
            : { visibility: 'hidden' }}
        >
          <p>{vocabularyPopup.meaning}</p>
        </section>,
        document.body,
      )}
    </div>
  );
}

export default PlayGame;
