import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import '../Styles/Story.css';
import { readGameSession, saveGameSession } from '../utils/gameSession';

const backendUrl = 'http://localhost:5000';

function Story() {
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
        if (
          savedSession?.themeId === themeId
          && savedSession?.difficulty === difficulty
          && savedSession?.themeIndex === themeIndex
          && typeof savedCase?.case_title === 'string'
          && typeof savedCase?.story === 'string'
        ) {
          return { caseStory: savedCase, sessionWarning: '' };
        }

        return axios
          .get(`${backendUrl}/api/cases`, {
            params: { theme_id: themeId, difficulty },
            signal: controller.signal,
          })
          .then(({ data }) => {
            let sessionWarning = '';
            try {
              saveGameSession({
                themeId,
                difficulty,
                themeIndex,
                caseStory: data,
              });
            } catch (sessionError) {
              sessionWarning = `The story loaded, but its temporary session could not be saved: ${sessionError.message}`;
            }
            return { caseStory: data, sessionWarning };
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
            <button className="choose-theme-page-button story-next-button" type="button">
              Next
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Story;
