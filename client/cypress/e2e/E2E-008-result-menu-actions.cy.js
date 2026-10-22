// E2E-008: Verify all Result menu actions.
import { visitResultWithSession } from '../support/gameFlow';

describe('E2E-008 result menu actions', () => {
  it('closes the menu and returns to Result', () => {
    visitResultWithSession();
    cy.get('button[aria-label="Open menu"]').click();
    cy.get('[role="dialog"][aria-labelledby="result-menu-title"]').should('be.visible');
    cy.contains('[role="dialog"] button', 'Close').click();
    cy.get('[role="dialog"][aria-labelledby="result-menu-title"]').should('not.exist');
    cy.location('pathname').should('eq', '/result');
  });

  it('navigates back to the introduction and clears the session', () => {
    visitResultWithSession();
    cy.get('button[aria-label="Open menu"]').click();
    cy.contains('[role="dialog"] a', 'Back to Introduction').click();
    cy.location('pathname').should('eq', '/');
    cy.window().then((window) => {
      expect(window.sessionStorage.getItem('wordectiveGameSession')).to.be.null;
    });
  });

  it('starts case selection again and clears the current session', () => {
    visitResultWithSession();
    cy.get('button[aria-label="Open menu"]').click();
    cy.contains('[role="dialog"] a', 'Choose Case Again').click();
    cy.location('pathname').should('eq', '/choose-theme');
    cy.window().then((window) => {
      expect(window.sessionStorage.getItem('wordectiveGameSession')).to.be.null;
    });
  });
});
