// CT-001: Open, close, and select a difficulty in the Choose Theme component.
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ChooseTheme from './ChooseTheme';
import { readGameSession } from '../utils/gameSession';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isCancel: vi.fn(() => false),
  },
}));

import axios from 'axios';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-location">{`${location.pathname}${location.search}`}</output>;
}

function renderChooseTheme() {
  return render(
    <MemoryRouter initialEntries={['/choose-theme']}>
      <ChooseTheme />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('CT-001 difficulty selection modal', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    axios.get.mockResolvedValue({
      data: [
        {
          theme_id: 'theme-1',
          theme_name: 'Prehistoric Age',
          description: 'A prehistoric mystery.',
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows all three difficulty options when Next is clicked', async () => {
    const user = userEvent.setup();
    renderChooseTheme();

    await user.click(await screen.findByRole('button', { name: 'Next' }));

    const dialog = screen.getByRole('dialog', { name: 'Choose Difficulty' });
    expect(within(dialog).getByRole('button', { name: 'Beginner' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Intermediate' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Expert' })).toBeInTheDocument();
  });

  it('closes the dialog with its close button or Escape key', async () => {
    const user = userEvent.setup();
    renderChooseTheme();

    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Close difficulty selection' }));
    expect(screen.queryByRole('dialog', { name: 'Choose Difficulty' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Choose Difficulty' })).not.toBeInTheDocument();
  });

  it('saves the selected difficulty and navigates to the story route', async () => {
    const user = userEvent.setup();
    renderChooseTheme();

    await user.click(await screen.findByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Expert' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent)
        .toBe('/story?theme_id=theme-1&difficulty=Expert&theme_index=1');
    });
    expect(readGameSession()).toMatchObject({
      themeId: 'theme-1',
      difficulty: 'Expert',
      themeIndex: 1,
      caseStory: null,
    });
  });
});
