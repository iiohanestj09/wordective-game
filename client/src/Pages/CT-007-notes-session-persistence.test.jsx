// CT-007: Edit notes and verify they persist in the game session.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlayGame from './PlayGame';
import { savePlayGameSession } from './componentTestHelpers';
import { readGameSession } from '../utils/gameSession';

describe('CT-007 notes persistence', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    savePlayGameSession({ notes: 'Initial observation' });
  });

  afterEach(() => cleanup());

  it('saves edited notes and displays them when reopened', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/play-game']}>
        <PlayGame />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Open notes' }));
    const notesField = screen.getByRole('textbox', { name: 'Your investigation notes' });
    expect(notesField).toHaveValue('Initial observation');

    await user.clear(notesField);
    await user.type(notesField, 'The footprints lead toward the river.');
    expect(readGameSession().notes).toBe('The footprints lead toward the river.');

    await user.click(screen.getByRole('button', { name: 'Close notes' }));
    await user.click(screen.getByRole('button', { name: 'Open notes' }));
    expect(screen.getByRole('textbox', { name: 'Your investigation notes' }))
      .toHaveValue('The footprints lead toward the river.');
  });
});
