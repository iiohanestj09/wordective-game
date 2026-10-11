import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../Styles/Story.css';
import { readGameSession, saveGameSession } from '../utils/gameSession';

const backendUrl = 'http://localhost:5000';

function shuffleClues(clues, previousOrder) {
  const shuffledClues = [...clues];
  for (let index = shuffledClues.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledClues[index], shuffledClues[randomIndex]] = [
      shuffledClues[randomIndex],
      shuffledClues[index],
    ];
  }

  const shuffledOrder = shuffledClues.map((clue) => String(clue.card_id));
  if (
    shuffledClues.length > 1
    && Array.isArray(previousOrder)
    && previousOrder.length === shuffledOrder.length
    && previousOrder.every((cardId, index) => cardId === shuffledOrder[index])
  ) {
    shuffledClues.push(shuffledClues.shift());
  }

  return shuffledClues;
}

function Story() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme_id');
  const difficulty = searchParams.get('difficulty');
  const themeIndex = Number(searchParams.get('theme_index'));
  const validThemeIndex = Number.isInteger(themeIndex) && themeIndex >= 1 && themeIndex <= 6;
  const requestKey = `${themeId ?? ''}:${difficulty ?? ''}`;
  const [storyResult, setStoryResult] = useState({
    requestKey: '',
    caseStory: null,
    error: '',
    sessionWarning: '',
  });
  const hasValidSelection = Boolean(themeId && difficulty && validThemeIndex);
  const isLoading = hasValidSelection && storyResult.requestKey !== requestKey;
  const caseStory = storyResult.requestKey === requestKey ? storyResult.caseStory : null;
  const error = !hasValidSelection
    ? 'A valid theme and difficulty selection are required. Please choose them first.'
    : storyResult.requestKey === requestKey
      ? storyResult.error
      : '';

  useEffect(() => {
    if (!hasValidSelection) {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    Promise.resolve()
      .then(() => {
        const savedSession = readGameSession();
        const savedCase = savedSession?.caseStory;
        const hasReusableCase = savedSession?.themeId === themeId
          && savedSession?.difficulty === difficulty
          && savedSession?.themeIndex === themeIndex
          && Array.isArray(savedCase?.cards)
          && savedCase.cards.length === 7
          && savedCase.cards.every(
            (card) => typeof card.card_title === 'string'
              && typeof card.content === 'string'
              && typeof card.img_url === 'string',
          )
          && Array.isArray(savedCase?.clues)
          && savedCase.clues.length === 3
          && savedCase.clues.every(
            (clue) => typeof clue.card_title === 'string'
              && typeof clue.content === 'string'
              && typeof clue.img_url === 'string',
          )
          && savedCase.case_id != null
          && typeof savedCase.case_title === 'string'
          && typeof savedCase.story === 'string';
        const hasVocabularyData = hasReusableCase
          && [...savedCase.cards, ...savedCase.clues].every(
            (card) => Array.isArray(card.vocabularies)
              && typeof card.main_idea === 'string',
          );

        if (hasVocabularyData) {
          const caseId = String(savedCase.case_id);
          if (Array.isArray(savedSession?.clueCardOrders?.[caseId])) {
            return { caseStory: savedCase, sessionWarning: '' };
          }

          const clues = shuffleClues(
            savedCase.clues,
            savedSession?.clueCardOrders?.[caseId],
          );
          const caseWithClues = { ...savedCase, clues };
          let sessionWarning = '';
          try {
            if (isActive) {
              saveGameSession({
                ...savedSession,
                caseStory: caseWithClues,
                clueCardOrders: {
                  ...savedSession?.clueCardOrders,
                  [caseId]: clues.map((clue) => String(clue.card_id)),
                },
              });
            }
          } catch (sessionError) {
            sessionWarning = `The story loaded, but its temporary session could not be saved: ${sessionError.message}`;
          }
          return { caseStory: caseWithClues, sessionWarning };
        }

        return axios
          .get(`${backendUrl}/api/cases`, {
            params: {
              theme_id: themeId,
              difficulty,
              ...(hasReusableCase ? { case_id: savedCase.case_id } : {}),
            },
            signal: controller.signal,
          })
          .then(({ data }) => {
            const savedSession = readGameSession();
            const caseId = String(data.case_id);
            const previousOrder = savedSession?.npcCardOrders?.[caseId];
            const previousClueOrder = savedSession?.clueCardOrders?.[caseId];
            let cards = [...data.cards];
            let clues = [...data.clues];
            const isRefreshingSavedCase = hasReusableCase
              && String(savedCase.case_id) === caseId;

            if (isRefreshingSavedCase) {
              const cardsById = new Map(
                cards.map((card) => [String(card.card_id), card]),
              );
              const cluesById = new Map(
                clues.map((clue) => [String(clue.card_id), clue]),
              );
              const savedCardOrder = savedCase.cards
                .map((card) => cardsById.get(String(card.card_id)))
                .filter(Boolean);
              const savedClueOrder = savedCase.clues
                .map((clue) => cluesById.get(String(clue.card_id)))
                .filter(Boolean);

              if (savedCardOrder.length === cards.length) {
                cards = savedCardOrder;
              }
              if (savedClueOrder.length === clues.length) {
                clues = savedClueOrder;
              }
            } else {
              clues = shuffleClues(clues, previousClueOrder);
            }

            const nextOrder = cards.map((card) => String(card.card_id));

            if (
              !isRefreshingSavedCase
              &&
              cards.length > 1
              && Array.isArray(previousOrder)
              && previousOrder.length === nextOrder.length
              && previousOrder.every((cardId, index) => cardId === nextOrder[index])
            ) {
              cards.push(cards.shift());
            }

            const caseWithCards = { ...data, cards, clues };
            const hints = isRefreshingSavedCase
              ? savedSession?.hints
              : { used: false, npcCardIds: [], clueCardIds: [] };
            let sessionWarning = '';
            try {
              if (!isActive) {
                return { caseStory: caseWithCards, sessionWarning };
              }

              saveGameSession({
                ...savedSession,
                themeId,
                difficulty,
                themeIndex,
                caseStory: caseWithCards,
                hints,
                npcCardOrders: {
                  ...savedSession?.npcCardOrders,
                  [caseId]: cards.map((card) => String(card.card_id)),
                },
                clueCardOrders: {
                  ...savedSession?.clueCardOrders,
                  [caseId]: clues.map((clue) => String(clue.card_id)),
                },
              });
            } catch (sessionError) {
              sessionWarning = `The story loaded, but its temporary session could not be saved: ${sessionError.message}`;
            }
            return { caseStory: caseWithCards, sessionWarning };
          });
      })
      .then(({ caseStory: loadedCase, sessionWarning }) => {
        if (isActive) {
          setStoryResult({
            requestKey,
            caseStory: loadedCase,
            error: '',
            sessionWarning,
          });
        }
      })
      .catch((requestError) => {
        if (isActive && !axios.isCancel(requestError)) {
          setStoryResult({
            requestKey,
            caseStory: null,
            error: requestError.response?.data?.message ?? requestError.message,
            sessionWarning: '',
          });
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [themeId, difficulty, themeIndex, hasValidSelection, requestKey]);

  return (
    <div className="story-page">
      <nav className="choose-theme-navbar story-navbar">
        <Link className="choose-theme-brand" to="/" aria-label="Wordective home">
          <img
            className="choose-theme-logo"
            src={`${backendUrl}/images/icons/logo.svg`}
            alt=""
          />
          <span>Wordective</span>
        </Link>
        <span className="choose-theme-nav-action story-nav-action">Story</span>
      </nav>

      <main className="story-main">
        <div className="story-titlebar">
          {caseStory && <h2 className="story-case-title">{caseStory.case_title}</h2>}
        </div>
        {isLoading ? (
          <p className="story-status" role="status">Loading story...</p>
        ) : error ? (
          <p className="story-status story-error" role="alert">{error}</p>
        ) : caseStory && (
          <>
            {storyResult.sessionWarning && (
              <p className="story-status story-error" role="alert">
                {storyResult.sessionWarning}
              </p>
            )}
            {validThemeIndex && (
              <img
                className="story-theme-image"
                src={`${backendUrl}/images/themes/t${themeIndex}.png`}
                alt=""
              />
            )}
            <p className="story-copy">{caseStory.story}</p>
            <button
              className="choose-theme-page-button story-next-button"
              onClick={() => navigate('/play-game')}
              type="button"
            >
              Next
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Story;
