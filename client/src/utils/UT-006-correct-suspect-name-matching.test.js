// UT-006: Match correct suspects by character name, not role or letter casing.
import { describe, expect, it } from 'vitest';
import { matchesSuspectName } from './suspectMatching';

describe('UT-006 correct suspect name matching', () => {
  it('matches normalized character names and rejects different characters', () => {
    expect(matchesSuspectName('  Dr. Mira, the Scientist  ', 'dr. mira')).toBe(true);
    expect(matchesSuspectName('Astra, the Navigator', 'Astra')).toBe(true);
    expect(matchesSuspectName('Astra, the Navigator', 'Stellan')).toBe(false);
  });
});
