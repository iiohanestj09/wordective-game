// E2E-002: Complete a case and display the incorrect guess and correct answer.
import {
  chooseSuspectAndContinue,
  readAllNpcCardsAndClues,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-002 incorrect answer flow', () => {
  it('shows the selected suspect alongside the correct answer', () => {
    startNewGame();
    readAllNpcCardsAndClues();
    chooseSuspectAndContinue(false);

    cy.contains('h2', 'Not quite!').should('be.visible');
    cy.contains('h2', 'The Correct Answer').should('be.visible');
    cy.get('.result-logic-notes').should('be.visible').and('not.be.empty');
  });
});
