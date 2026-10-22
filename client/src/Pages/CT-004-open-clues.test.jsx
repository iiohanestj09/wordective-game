// CT-004: Open the clues modal and persist that clues were viewed.
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlayGame from './PlayGame';
import { savePlayGameSession } from './componentTestHelpers';
import { readGameSession } from '../utils/gameSession';

describe('CT-004 open clues', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    savePlayGameSession();
  });

  afterEach(() => cleanup());

  it('shows all three clues and records that the clues were viewed', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/play-game']}>
        <PlayGame />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Reveal clues' }));

    const dialog = screen.getByRole('dialog', { name: 'Three clues' });
    expect(within(dialog).getByRole('article', { name: 'Clue 1' })).toBeInTheDocument();
    expect(within(dialog).getByRole('article', { name: 'Clue 2' })).toBeInTheDocument();
    expect(within(dialog).getByRole('article', { name: 'Clue 3' })).toBeInTheDocument();
    expect(readGameSession().cluesViewed).toBe(true);

    await waitFor(() => {
      expect(within(dialog).getByRole('heading', { name: 'Clue 1' })).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: 'Clue 2' })).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: 'Clue 3' })).toBeInTheDocument();
    });
  });
});
