// CT-002: Flip an NPC card, open its details, and save its read status.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlayGame from './PlayGame';
import { savePlayGameSession } from './componentTestHelpers';
import { readGameSession } from '../utils/gameSession';

describe('CT-002 NPC card details', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    savePlayGameSession();
  });

  afterEach(() => cleanup());

  it('flips a card and opens its details on the next click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/play-game']}>
        <PlayGame />
      </MemoryRouter>,
    );

    const card = screen.getByRole('button', {
      name: 'Suspect 1, the Investigator, open card',
    });
    await user.click(card);

    expect(card).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('dialog', { name: 'Suspect 1' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {
      name: 'Suspect 1, the Investigator, card open',
    }));

    expect(screen.getByRole('dialog', { name: 'Suspect 1' })).toBeInTheDocument();
    expect(screen.getByText('Statement for suspect 1.')).toBeInTheDocument();
    expect(readGameSession().readNpcCardIds).toContain('npc-1');
  });
});
