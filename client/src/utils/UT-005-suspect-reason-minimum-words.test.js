// UT-005: Validate the minimum 10-word suspect reason.
import { describe, expect, it } from 'vitest';
import { countWords, hasMinimumWords } from './reasonValidation';

describe('UT-005 suspect reason minimum word count', () => {
  it('accepts at least 10 words and rejects shorter or empty reasons', () => {
    const nineWords = 'I chose this person because the clues point there';
    const tenWords = `${nineWords} clearly`;
    const tenWordsWithExtraSpaces = '  I chose   this person because the clues point there clearly  ';

    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
    expect(countWords(nineWords)).toBe(9);
    expect(hasMinimumWords(nineWords, 10)).toBe(false);
    expect(countWords(tenWords)).toBe(10);
    expect(hasMinimumWords(tenWords, 10)).toBe(true);
    expect(countWords(tenWordsWithExtraSpaces)).toBe(10);
    expect(hasMinimumWords(tenWordsWithExtraSpaces, 10)).toBe(true);
  });
});
