// CT-008: Render correct and incorrect suspect result states.
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Result from './Result';
import { makePlayGameSession } from './componentTestHelpers';
import { saveGameSession } from '../utils/gameSession';

describe('CT-008 result states', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => cleanup());

  it('shows the correct-answer message and logic notes for a correct guess', () => {
    saveGameSession({
      ...makePlayGameSession(),
      selectedSuspectCardId: 'npc-1',
      selectedSuspectName: 'Suspect 1',
    });

    render(
      <MemoryRouter initialEntries={['/result']}>
        <Result />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: "You're right!" })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suspect 1, the Investigator' }))
      .toBeInTheDocument();
    expect(screen.getByText('Test logic notes.')).toBeInTheDocument();
  });

  it('shows the selected suspect and correct answer for an incorrect guess', () => {
    saveGameSession({
      ...makePlayGameSession(),
      selectedSuspectCardId: 'npc-2',
      selectedSuspectName: 'Suspect 2',
    });

    render(
      <MemoryRouter initialEntries={['/result']}>
        <Result />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Not quite!' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Correct Answer' }))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suspect 2, the Investigator' }))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Suspect 1, the Investigator' }))
      .toBeInTheDocument();
    expect(screen.getByText('Test logic notes.')).toBeInTheDocument();
  });
});
