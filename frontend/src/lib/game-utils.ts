export const TOTAL_SEQUENCE_LENGTH = 20;
export const PENALTY_PER_ERROR_SECONDS = 0.5;
export const LOCAL_STORAGE_PB_KEY = 'typing_game_personal_best';

export function generateRandomSequence(length: number = TOTAL_SEQUENCE_LENGTH): string[] {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    sequence.push(alphabet[randomIndex]);
  }
  return sequence;
}

export function calculateFinalScore(rawDuration: number, wrongAttempts: number): {
  penaltyTime: number;
  finalScore: number;
} {
  const penaltyTime = parseFloat((wrongAttempts * PENALTY_PER_ERROR_SECONDS).toFixed(3));
  const finalScore = parseFloat((rawDuration + penaltyTime).toFixed(3));
  return { penaltyTime, finalScore };
}

export function getLocalPersonalBest(): number | null {
  if (typeof window === 'undefined') return null;
  const pbStr = localStorage.getItem(LOCAL_STORAGE_PB_KEY);
  if (!pbStr) return null;
  const pb = parseFloat(pbStr);
  return isNaN(pb) ? null : pb;
}

export function saveLocalPersonalBest(newScore: number): boolean {
  if (typeof window === 'undefined') return false;
  const currentPB = getLocalPersonalBest();
  if (currentPB === null || newScore < currentPB) {
    localStorage.setItem(LOCAL_STORAGE_PB_KEY, newScore.toFixed(3));
    return true; // Indicates new personal record set!
  }
  return false;
}
