export function startNewGame() {
  cy.visit('/choose-theme', {
    onBeforeLoad(window) {
      window.sessionStorage.clear();
    },
  });

  cy.contains('button', 'Next').should('be.enabled').click();
  cy.contains('[role="dialog"] button', 'Beginner').click();
  cy.contains('button', 'Next').should('be.visible').click();
  cy.location('pathname').should('eq', '/play-game');
}

export function readAllNpcCardsAndClues() {
  cy.window().then((window) => {
    const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
    expect(session.caseStory.cards).to.have.length(7);
    expect(session.caseStory.clues).to.have.length(3);

    session.caseStory.cards.forEach((card) => {
      cy.get(`button[aria-label="${card.card_title}, open card"]`).click();
      cy.get(`button[aria-label="${card.card_title}, card open"]`).click();
      cy.get('[role="dialog"][aria-labelledby="play-game-npc-modal-name"]')
        .should('be.visible')
        .and('contain', card.card_title.split(',')[0].trim());
      cy.get('button[aria-label="Close NPC details"]').click();
    });

    cy.get('button[aria-label="Reveal clues"]').click();
    cy.get('[role="dialog"][aria-label="Three clues"]').should('be.visible');
    session.caseStory.clues.forEach((clue) => {
      cy.get('[role="dialog"][aria-label="Three clues"]')
        .should('contain', clue.card_title);
    });
    cy.get('[role="dialog"][aria-label="Three clues"] button[aria-label="Close all clues"]')
      .first()
      .click();
  });

  cy.contains('button', 'Choose A Suspect').click();
  cy.location('pathname').should('eq', '/choose-suspect');
}

export function readNpcCards(cardIds) {
  cy.window().then((window) => {
    const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
    const cards = session.caseStory.cards.filter(
      (card) => cardIds.includes(String(card.card_id)),
    );
    expect(cards, 'all required NPC cards exist').to.have.length(cardIds.length);

    cards.forEach((card) => {
      cy.get(`button[aria-label="${card.card_title}, open card"]`).click();
      cy.get(`button[aria-label="${card.card_title}, card open"]`).click();
      cy.get('[role="dialog"][aria-labelledby="play-game-npc-modal-name"]')
        .should('be.visible')
        .and('contain', card.card_title.split(',')[0].trim());
      cy.get('button[aria-label="Close NPC details"]').click();
    });
  });
}

export function openClues() {
  cy.get('button[aria-label="Reveal clues"]').click();
  cy.get('[role="dialog"][aria-label="Three clues"]').should('be.visible');
  cy.get('[role="dialog"][aria-label="Three clues"] button[aria-label="Close all clues"]')
    .first()
    .click();
}

export function chooseSuspectAndContinue(chooseCorrect) {
  cy.window().then((window) => {
    const session = JSON.parse(window.sessionStorage.getItem('wordectiveGameSession'));
    const correctName = session.caseStory.correct_suspect.trim().toLowerCase();
    const correctCard = session.caseStory.cards.find(
      (card) => card.card_title.split(',')[0].trim().toLowerCase() === correctName,
    );
    expect(correctCard, 'correct suspect card exists').to.exist;

    const selectedCard = chooseCorrect
      ? correctCard
      : session.caseStory.cards.find((card) => card.card_id !== correctCard.card_id);
    expect(selectedCard, 'selected suspect card exists').to.exist;

    cy.get(`button[aria-label="Choose ${selectedCard.card_title.split(',')[0].trim()} as suspect"]`)
      .click();
  });

  cy.get('[role="dialog"][aria-labelledby="choose-suspect-confirm-title"]')
    .should('be.visible');
  cy.get('#choose-suspect-reason')
    .type('I chose this suspect because several clues connect them to the case.');
  cy.get('[role="dialog"] button').contains('Next').should('be.enabled').click();
  cy.location('pathname').should('eq', '/result');
}

export function visitResultWithSession(selectedCardId = 'npc-1') {
  const cards = Array.from({ length: 7 }, (_, index) => ({
    card_id: `npc-${index + 1}`,
    card_title: `Suspect ${index + 1}, the Investigator`,
    img_url: 'themes/theme1/p1.png',
  }));
  const session = {
    themeId: 'theme-1',
    difficulty: 'Beginner',
    themeIndex: 1,
    selectedSuspectCardId: selectedCardId,
    caseStory: {
      case_id: 'case-1',
      correct_suspect: 'Suspect 1',
      logic_notes: 'The evidence points to Suspect 1.',
      cards,
    },
  };

  cy.visit('/result', {
    onBeforeLoad(window) {
      window.sessionStorage.setItem('wordectiveGameSession', JSON.stringify(session));
    },
  });
}
