// E2E-005: Show only the investigation requirements that are still incomplete.
import {
  openClues,
  readNpcCards,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-005 requirements modal states', () => {
  it('updates the gate message after NPC cards are read and then opens suspect selection', () => {
    startNewGame();
    cy.window().then((window) => {
      const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
      readNpcCards(session.caseStory.cards.map((card) => String(card.card_id)));
    });

    cy.contains('button', 'Choose A Suspect').click();
    cy.get('[role="dialog"][aria-labelledby="play-game-requirements-title"]')
      .should('contain', 'Open the clues and review them before choosing a suspect.')
      .and('not.contain', 'Open and Read all NPC cards before choosing a suspect.');
    cy.contains('[role="dialog"] button', 'Continue Reading').click();

    openClues();
    cy.contains('button', 'Choose A Suspect').click();
    cy.location('pathname').should('eq', '/choose-suspect');
  });
});
