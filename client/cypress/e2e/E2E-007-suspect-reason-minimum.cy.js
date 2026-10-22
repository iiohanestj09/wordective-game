// E2E-007: Require at least 10 words before continuing to the result page.
import {
  readAllNpcCardsAndClues,
  startNewGame,
} from '../support/gameFlow';

describe('E2E-007 suspect reason word minimum', () => {
  it('keeps Next disabled at 9 words and enables it at 10 words', () => {
    startNewGame();
    readAllNpcCardsAndClues();

    cy.window().then((window) => {
      const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
      const suspectName = session.caseStory.cards[0].card_title.split(',')[0].trim();
      cy.get(`button[aria-label="Choose ${suspectName} as suspect"]`).click();
    });

    cy.get('#choose-suspect-reason')
      .type('I chose this suspect because the evidence seems convincing');
    cy.get('#choose-suspect-reason')
      .invoke('val')
      .then((reason) => expect(reason.trim().split(/\s+/)).to.have.length(9));
    cy.contains('[role="dialog"] button', 'Next').should('be.disabled');

    cy.get('#choose-suspect-reason').type(' today');
    cy.get('#choose-suspect-reason')
      .invoke('val')
      .then((reason) => expect(reason.trim().split(/\s+/)).to.have.length(10));
    cy.contains('[role="dialog"] button', 'Next').should('be.enabled').click();
    cy.location('pathname').should('eq', '/result');
  });
});
