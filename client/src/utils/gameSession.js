const gameSessionStorageKey = 'wordectiveGameSession';

export function readGameSession() {
  const storedSession = window.sessionStorage.getItem(gameSessionStorageKey);
  return storedSession ? JSON.parse(storedSession) : null;
}

export function clearGameSession() {
  window.sessionStorage.removeItem(gameSessionStorageKey);
}

export function saveGameSession(gameSession) {
  const previousSession = readGameSession();
  const npcCardOrders = gameSession.npcCardOrders
    ?? previousSession?.npcCardOrders
    ?? {};
  const clueCardOrders = gameSession.clueCardOrders
    ?? previousSession?.clueCardOrders
    ?? {};

  window.sessionStorage.setItem(
    gameSessionStorageKey,
    JSON.stringify({ ...gameSession, npcCardOrders, clueCardOrders }),
  );
}

export function updateGameSession(updates) {
  const currentSession = readGameSession();
  if (!currentSession) {
    throw new Error('No active game session is available.');
  }

  saveGameSession({ ...currentSession, ...updates });
}
