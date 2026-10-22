// CT-003: Apply the configured Beginner hints once and reveal a hinted NPC idea.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlayGame from './PlayGame';
import { savePlayGameSession } from './componentTestHelpers';
import { readGameSession } from '../utils/gameSession';

describe('CT-003 use hints', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    savePlayGameSession();
  });

  afterEach(() => cleanup());

  it('selects the configured hints, reveals their idea, and prevents reuse', async () => {
    const user = userEvent.setup();
    const { caseStory } = savePlayGameSession();
    render(
      <MemoryRouter initialEntries={['/play-game']}>
        <PlayGame />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Use hints' }));

    const savedSession = readGameSession();
    expect(savedSession.hints.used).toBe(true);
    expect(savedSession.hints.npcCardIds).toHaveLength(5);
    expect(savedSession.hints.clueCardIds).toHaveLength(3);

    const hintedCardId = savedSession.hints.npcCardIds[0];
    const hintedCard = caseStory.cards.find(
      (card) => card.card_id === hintedCardId,
    );
    await user.click(screen.getByRole('button', {
      name: `${hintedCard.card_title}, open card`,
    }));
    await user.click(screen.getByRole('button', {
      name: `${hintedCard.card_title}, card open`,
    }));

    expect(screen.getByRole('complementary', { name: 'Main idea hint' }))
      .toHaveTextContent(hintedCard.main_idea);
    expect(screen.getByRole('button', { name: 'Hints already used' })).toBeDisabled();
  });
});
