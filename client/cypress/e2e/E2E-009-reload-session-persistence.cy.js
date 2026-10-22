// E2E-009: Preserve the active case and saved NPC-reading progress on reload.
import { startNewGame } from '../support/gameFlow';

describe('E2E-009 reload session persistence', () => {
  it('keeps the same case and saved NPC reading progress after reload', () => {
    startNewGame();
    cy.window().then((window) => {
      const initialSession = JSON.parse(
        window.sessionStorage.getItem('wordectiveGameSession'),
      );
      const card = initialSession.caseStory.cards[0];

      cy.get(`button[aria-label="${card.card_title}, open card"]`).click();
      cy.get(`button[aria-label="${card.card_title}, card open"]`).click();
      cy.get('button[aria-label="Close NPC details"]').click();
      cy.reload();

      cy.window().then((reloadedWindow) => {
        const reloadedSession = JSON.parse(
          reloadedWindow.sessionStorage.getItem('wordectiveGameSession'),
        );
        expect(reloadedSession.caseStory.case_id).to.equal(initialSession.caseStory.case_id);
        expect(reloadedSession.caseStory.case_title).to.equal(initialSession.caseStory.case_title);
        expect(reloadedSession.readNpcCardIds).to.include(String(card.card_id));
      });
    });
  });
});
