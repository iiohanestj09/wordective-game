// UT-002: Update selected session fields without losing existing data.
import { beforeEach, describe, expect, it } from 'vitest';
import {
  readGameSession,
  saveGameSession,
  updateGameSession,
} from './gameSession';

describe('UT-002 game session update', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('updates notes and preserves the rest of the session and card orders', () => {
    saveGameSession({
      themeId: 'theme-1',
      difficulty: 'Expert',
      notes: '',
      npcCardOrders: { case1: ['npc1', 'npc2'] },
      clueCardOrders: { case1: ['clue1'] },
    });

    updateGameSession({ notes: 'Review the clue' });

    expect(readGameSession()).toEqual({
      themeId: 'theme-1',
      difficulty: 'Expert',
      notes: 'Review the clue',
      npcCardOrders: { case1: ['npc1', 'npc2'] },
      clueCardOrders: { case1: ['clue1'] },
    });
  });
});
