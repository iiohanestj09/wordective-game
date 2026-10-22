// UT-003: Reject session updates when no active session exists.
import { beforeEach, describe, expect, it } from 'vitest';
import { updateGameSession } from './gameSession';

describe('UT-003 update without an active game session', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('throws a clear error instead of creating a session', () => {
    expect(() => updateGameSession({ notes: 'A note' }))
      .toThrow('No active game session is available.');
    expect(window.sessionStorage.length).toBe(0);
  });
});
