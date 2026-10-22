// CT-005: Block suspect selection until all NPC cards and clues are reviewed.
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import PlayGame from './PlayGame';
import { savePlayGameSession } from './componentTestHelpers';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}</output>;
}

describe('CT-005 suspect selection gate', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    savePlayGameSession();
  });

  afterEach(() => cleanup());

  it('shows the incomplete NPC and clue requirements and stays on Play Game', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/play-game']}>
        <PlayGame />
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Choose A Suspect' }));

    const dialog = screen.getByRole('dialog', { name: 'Before Choosing a Suspect' });
    expect(withinText(dialog, 'Open and Read all NPC cards before choosing a suspect.'))
      .toBeInTheDocument();
    expect(withinText(dialog, 'Open the clues and review them before choosing a suspect.'))
      .toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent('/play-game');
  });
});

function withinText(container, text) {
  return [...container.querySelectorAll('p')].find((paragraph) => paragraph.textContent === text);
}
