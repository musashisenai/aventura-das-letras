const GENERIC_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Sorteia uma letra sem valor sonoro, usada apenas como marca de cada batida silábica. */
export function randomSyllableMark(random: () => number = Math.random): string {
  const sample = Math.min(1 - Number.EPSILON, Math.max(0, random()));
  return GENERIC_LETTERS[Math.floor(sample * GENERIC_LETTERS.length)];
}
