// E2E-003: Prevent suspect selection until NPC cards and clues are reviewed.
import { startNewGame } from '../support/gameFlow';

describe('E2E-003 suspect requirements gate', () => {
  it('blocks navigation and shows the uncompleted investigation requirements', () => {
    startNewGame();
    cy.contains('button', 'Choose A Suspect').click();

    cy.get('[role="dialog"][aria-labelledby="play-game-requirements-title"]')
      .should('be.visible')
      .and('contain', 'Open and Read all NPC cards before choosing a suspect.')
      .and('contain', 'Open the clues and review them before choosing a suspect.');
    cy.location('pathname').should('eq', '/play-game');

    cy.contains('[role="dialog"] button', 'Continue Reading').click();
    cy.get('[role="dialog"][aria-labelledby="play-game-requirements-title"]')
      .should('not.exist');
    cy.location('pathname').should('eq', '/play-game');
  });
});
