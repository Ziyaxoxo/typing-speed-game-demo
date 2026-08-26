import { describe, it, expect } from 'vitest';
import {
  generateRandomSequence,
  calculateFinalScore,
  TOTAL_SEQUENCE_LENGTH,
  PENALTY_PER_ERROR_SECONDS,
} from '../lib/game-utils.js';

describe('Frontend Typing Engine Utilities', () => {
  it('should generate a sequence of exactly 20 random alphabetic characters [a-z]', () => {
    const sequence = generateRandomSequence(TOTAL_SEQUENCE_LENGTH);

    expect(sequence).toHaveLength(20);
    sequence.forEach((char) => {
      expect(typeof char).toBe('string');
      expect(char).toMatch(/^[a-z]$/);
    });
  });

  it('should calculate score correctly with 0 wrong attempts', () => {
    const rawDuration = 2.45;
    const wrongAttempts = 0;
    const { penaltyTime, finalScore } = calculateFinalScore(rawDuration, wrongAttempts);

    expect(penaltyTime).toBe(0);
    expect(finalScore).toBe(2.45);
  });

  it('should calculate score correctly with multiple wrong attempts (+0.5s each)', () => {
    const rawDuration = 5.10;
    const wrongAttempts = 4;
    const { penaltyTime, finalScore } = calculateFinalScore(rawDuration, wrongAttempts);

    expect(penaltyTime).toBe(4 * PENALTY_PER_ERROR_SECONDS); // 2.0s
    expect(finalScore).toBe(7.10);
  });
});
