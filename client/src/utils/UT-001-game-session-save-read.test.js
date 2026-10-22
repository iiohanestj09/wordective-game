// UT-001: Save and read a game session.
import { beforeEach, describe, expect, it } from 'vitest';
import { readGameSession, saveGameSession } from './gameSession';

describe('UT-001 game session save and read', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns the saved session and initializes missing card orders', () => {
    const session = {
      themeId: 'theme-1',
      difficulty: 'Beginner',
      notes: 'Check the footprints',
    };

    saveGameSession(session);

    expect(readGameSession()).toEqual({
      ...session,
      npcCardOrders: {},
      clueCardOrders: {},
    });
  });
});
