const gameSessionStorageKey = 'wordectiveGameSession';

export function readGameSession() {
  const storedSession = window.sessionStorage.getItem(gameSessionStorageKey);
  return storedSession ? JSON.parse(storedSession) : null;
}

export function saveGameSession(gameSession) {
  window.sessionStorage.setItem(
    gameSessionStorageKey,
    JSON.stringify(gameSession),
  );
}
