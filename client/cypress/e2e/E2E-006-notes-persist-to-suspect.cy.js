// E2E-006: Preserve investigation notes from Play Game to Choose Suspect.
import {
  readAllNpcCardsAndClues,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-006 notes across game pages', () => {
  it('keeps notes after navigating from Play Game to Choose Suspect', () => {
    startNewGame();
    cy.get('button[aria-label="Open notes"]').click();
    cy.get('#play-game-notes-input')
      .type('The footprints lead toward the river and the witness saw a strap.');
    cy.get('button[aria-label="Close notes"]').click();

    readAllNpcCardsAndClues();
    cy.get('button[aria-label="Open notes"]').click();
    cy.get('#choose-suspect-notes-input')
      .should('have.value', 'The footprints lead toward the river and the witness saw a strap.');
  });
});
