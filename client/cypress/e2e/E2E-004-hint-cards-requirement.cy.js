// E2E-004: Require reading hinted NPC cards and clues before suspect selection.
import {
  openClues,
  readNpcCards,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-004 hinted NPC requirements', () => {
  it('allows suspect selection after all hinted NPC cards and clues are reviewed', () => {
    startNewGame();
    cy.get('button[aria-label="Use hints"]').click();

    cy.window().then((window) => {
      const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
      expect(session.hints.npcCardIds).to.have.length(5);
      readNpcCards(session.hints.npcCardIds);
    });

    cy.contains('button', 'Choose A Suspect').click();
    cy.get('[role="dialog"][aria-labelledby="play-game-requirements-title"]')
      .should('be.visible')
      .and('not.contain', 'Open and Read all NPC cards with hints')
      .and('contain', 'Open the clues and review them before choosing a suspect.');
    cy.location('pathname').should('eq', '/play-game');

    cy.contains('[role="dialog"] button', 'Continue Reading').click();
    openClues();
    cy.contains('button', 'Choose A Suspect').click();
    cy.location('pathname').should('eq', '/choose-suspect');
  });
});
