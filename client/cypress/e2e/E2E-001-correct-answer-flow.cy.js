// E2E-001: Complete a case and display the correct answer result.
import {
  chooseSuspectAndContinue,
  readAllNpcCardsAndClues,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-001 correct answer flow', () => {
  it('completes investigation and shows the correct answer', () => {
    startNewGame();
    readAllNpcCardsAndClues();
    chooseSuspectAndContinue(true);

    cy.contains('h1', "You're right!").should('be.visible');
    cy.get('.result-logic-notes').should('be.visible').and('not.be.empty');
  });
});
