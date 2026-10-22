function normalizeCharacterName(name) {
  return name
    .split(',')[0]
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase();
}

export function matchesSuspectName(cardTitle, suspectName) {
  return normalizeCharacterName(cardTitle) === normalizeCharacterName(suspectName);
}
