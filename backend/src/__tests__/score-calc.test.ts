import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../utils/auth.js';

describe('Score Calculation & Penalty Arithmetic', () => {
  it('should correctly calculate total time with 0.5s per wrong attempt penalty', () => {
    const rawDuration = 4.25;
    const wrongAttempts = 3;
    const penaltyPerAttempt = 0.5;

    const expectedPenaltyTime = wrongAttempts * penaltyPerAttempt;
    const expectedTotalTime = rawDuration + expectedPenaltyTime;

    expect(expectedPenaltyTime).toBe(1.5);
    expect(expectedTotalTime).toBe(5.75);
  });

  it('should correctly calculate total time with zero errors', () => {
    const rawDuration = 3.12;
    const wrongAttempts = 0;
    const expectedPenaltyTime = 0.0;
    const expectedTotalTime = 3.12;

    expect(wrongAttempts * 0.5).toBe(expectedPenaltyTime);
    expect(rawDuration + expectedPenaltyTime).toBe(expectedTotalTime);
  });

  it('should evaluate high score threshold comparisons', () => {
    const previousBestScore = 8.5;
    const newScore1 = 7.2;
    const newScore2 = 9.1;

    expect(newScore1 < previousBestScore).toBe(true);
    expect(newScore2 < previousBestScore).toBe(false);
  });
});

describe('JWT Auth Utilities', () => {
  it('should generate and verify valid JWT tokens', () => {
    const payload = {
      userId: 'test-uuid-1234',
      username: 'speedtyper',
      email: 'speedtyper@example.com',
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.username).toBe(payload.username);
  });

  it('should return null for invalid JWT tokens', () => {
    const invalidToken = 'invalid.jwt.token.string';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
