import { saveGameSession } from '../utils/gameSession';

export function makePlayGameSession(overrides = {}) {
  const cards = Array.from({ length: 7 }, (_, index) => ({
    card_id: `npc-${index + 1}`,
    card_title: `Suspect ${index + 1}, the Investigator`,
    content: `Statement for suspect ${index + 1}.`,
    main_idea: `Main idea for suspect ${index + 1}.`,
    gender: 'Women',
    img_url: 'themes/theme1/p1.png',
    vocabularies: [],
  }));
  const clues = Array.from({ length: 3 }, (_, index) => ({
    card_id: `clue-${index + 1}`,
    card_title: `Clue ${index + 1}`,
    content: `Evidence from clue ${index + 1}.`,
    main_idea: `Clue idea ${index + 1}.`,
    gender: null,
    img_url: 'icons/clover.png',
    vocabularies: [],
  }));

  return {
    themeId: 'theme-1',
    difficulty: 'Beginner',
    themeIndex: 1,
    notes: '',
    hints: { used: false, npcCardIds: [], clueCardIds: [] },
    readNpcCardIds: [],
    cluesViewed: false,
    caseStory: {
      case_id: 'case-1',
      case_title: 'Test Case',
      story: 'A test mystery.',
      correct_suspect: 'Suspect 1',
      logic_notes: 'Test logic notes.',
      cards,
      clues,
    },
    ...overrides,
  };
}

export function savePlayGameSession(overrides = {}) {
  const session = makePlayGameSession(overrides);
  saveGameSession(session);
  return session;
}
