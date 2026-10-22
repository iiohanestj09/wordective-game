// CT-006: Enforce the 10-word minimum in the Choose Suspect component.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ChooseSuspect from './ChooseSuspect';
import { saveGameSession } from '../utils/gameSession';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}</output>;
}

function makeGameSession() {
  return {
    themeId: 'theme-1',
    difficulty: 'Beginner',
    themeIndex: 1,
    caseStory: {
      cards: Array.from({ length: 7 }, (_, index) => ({
        card_id: `npc-${index + 1}`,
        card_title: `Suspect ${index + 1}, the Investigator`,
        img_url: 'themes/theme1/p1.png',
      })),
    },
  };
}

describe('CT-006 suspect reason validation', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    saveGameSession(makeGameSession());
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps Next disabled below 10 words and enables it at 10 words', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/choose-suspect']}>
        <ChooseSuspect />
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Choose Suspect 1 as suspect' }));
    const reasonField = screen.getByRole('textbox', { name: 'Your reason' });
    const nextButton = screen.getByRole('button', { name: 'Next' });

    expect(reasonField).toHaveAttribute(
      'placeholder',
      'Please enter a reason with at least 10 words',
    );
    expect(nextButton).toBeDisabled();

    await user.type(reasonField, 'I chose this suspect because clues point there');
    expect(nextButton).toBeDisabled();

    await user.type(reasonField, ' after reviewing evidence carefully');
    expect(nextButton).toBeEnabled();
    expect(reasonField).toHaveAttribute('placeholder', 'Write your reason...');

    await user.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe('/result');
    });
  });
});
