// UT-004: Clear the game session without clearing unrelated storage.
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearGameSession,
  readGameSession,
  saveGameSession,
} from './gameSession';

describe('UT-004 clear game session', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('removes only the Wordective game session', () => {
    saveGameSession({ themeId: 'theme-1' });
    window.sessionStorage.setItem('unrelated', 'keep me');

    clearGameSession();

    expect(readGameSession()).toBeNull();
    expect(window.sessionStorage.getItem('unrelated')).toBe('keep me');
  });
});
