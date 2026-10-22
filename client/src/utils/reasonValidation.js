export function countWords(text) {
  const trimmedText = text.trim();
  return trimmedText ? trimmedText.split(/\s+/).length : 0;
}

export function hasMinimumWords(text, minimumWords) {
  return countWords(text) >= minimumWords;
}
