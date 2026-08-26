'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../lib/auth-context';
import { fetchGraphQL } from '../lib/graphql-client';
import {
  generateRandomSequence,
  calculateFinalScore,
  TOTAL_SEQUENCE_LENGTH,
  PENALTY_PER_ERROR_SECONDS,
} from '../lib/game-utils';
import { Play, RotateCcw, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';

const SAVE_GAME_RESULT_MUTATION = /* GraphQL */ `
  mutation SaveGameResult($input: SaveGameResultInput!) {
    saveGameResult(input: $input) {
      id
      totalTime
      wrongAttempts
      penaltyTime
    }
  }
`;

export const TypingEngine: React.FC = () => {
  const { token, personalBest, updatePersonalBest, refreshUserData } = useAuth();

  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasErrorState, setHasErrorState] = useState<boolean>(false);

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalScoreDetails, setFinalScoreDetails] = useState<{
    rawDuration: number;
    penaltyTime: number;
    finalScore: number;
    isNewPB: boolean;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newSeq = generateRandomSequence(TOTAL_SEQUENCE_LENGTH);
    setSequence(newSeq);
    setCurrentIndex(0);
    setWrongAttempts(0);
    setElapsedTime(0);
    setIsGameActive(false);
    setIsCompleted(false);
    setHasErrorState(false);
    setFinalScoreDetails(null);
    setSaveError(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const lockFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isGameActive && !isCompleted) {
      lockFocus();
      const interval = setInterval(lockFocus, 150);
      return () => clearInterval(interval);
    }
  }, [isGameActive, isCompleted, lockFocus]);

  const startGame = () => {
    initGame();
    setIsGameActive(true);
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime((Date.now() - startTimeRef.current) / 1000);
      }
    }, 10);

    setTimeout(lockFocus, 30);
  };

  const completeGame = useCallback(
    async (finalRawDuration: number, finalWrongCount: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsGameActive(false);
      setIsCompleted(true);

      const { penaltyTime, finalScore } = calculateFinalScore(finalRawDuration, finalWrongCount);
      const isNewPB = updatePersonalBest(finalScore);

      setFinalScoreDetails({
        rawDuration: parseFloat(finalRawDuration.toFixed(3)),
        penaltyTime,
        finalScore,
        isNewPB,
      });

      if (token) {
        setIsSubmitting(true);
        try {
          await fetchGraphQL(
            SAVE_GAME_RESULT_MUTATION,
            {
              input: {
                rawDuration: parseFloat(finalRawDuration.toFixed(3)),
                wrongAttempts: finalWrongCount,
                correctChars: TOTAL_SEQUENCE_LENGTH,
              },
            },
            token
          );
          await refreshUserData();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to save score';
          setSaveError(msg);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [token, updatePersonalBest, refreshUserData]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isGameActive || isCompleted) return;

    const key = e.key.toLowerCase();
    if (['shift', 'control', 'alt', 'meta', 'tab', 'capslock', 'escape'].includes(key)) {
      return;
    }

    const targetChar = sequence[currentIndex];

    if (key === targetChar) {
      setHasErrorState(false);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= TOTAL_SEQUENCE_LENGTH) {
        const finalRaw = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : elapsedTime;
        completeGame(finalRaw, wrongAttempts);
      }
    } else {
      setWrongAttempts((prev) => prev + 1);
      setHasErrorState(true);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute pointer-events-none w-0 h-0"
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (isGameActive && !isCompleted) lockFocus();
        }}
        autoFocus
      />

      <div
        onClick={lockFocus}
        className={`w-full rounded-lg p-6 sm:p-8 cursor-text bg-[#161b22] border transition-colors ${
          isGameActive ? 'border-[#58a6ff]' : 'border-[#30363d]'
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-[#8b949e] block">Time</span>
            <span className="text-2xl font-mono font-bold text-white">
              {elapsedTime.toFixed(2)}<span className="text-xs text-[#8b949e]">s</span>
            </span>
          </div>

          <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-[#8b949e] block">Progress</span>
            <span className="text-2xl font-mono font-bold text-[#3fb950]">
              {currentIndex} <span className="text-xs text-[#8b949e] font-normal">/ {TOTAL_SEQUENCE_LENGTH}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-[#8b949e] block">Errors</span>
            <span className={`text-2xl font-mono font-bold ${wrongAttempts > 0 ? 'text-[#f85149]' : 'text-[#8b949e]'}`}>
              {wrongAttempts} <span className="text-xs text-[#8b949e] font-normal">(+{(wrongAttempts * PENALTY_PER_ERROR_SECONDS).toFixed(1)}s)</span>
            </span>
          </div>

          <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-[#8b949e] block">Best Score</span>
            <span className="text-2xl font-mono font-bold text-[#d29922]">
              {personalBest !== null ? `${personalBest.toFixed(2)}s` : '--'}
            </span>
          </div>
        </div>

        <div className="min-h-[120px] flex items-center justify-center mb-6">
          {!isGameActive && !isCompleted ? (
            <div className="text-center py-4">
              <p className="text-xs text-[#8b949e] mb-4">Press below to begin 20-alphabet speed test</p>
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Game</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-wrap items-center justify-center gap-2">
              {sequence.map((char, idx) => {
                let cellClass = 'char-default';
                if (idx < currentIndex) {
                  cellClass = 'char-done';
                } else if (idx === currentIndex) {
                  cellClass = hasErrorState ? 'char-error-state' : 'char-current';
                }

                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-md flex flex-col items-center justify-center font-mono font-bold text-2xl uppercase char-cell ${cellClass}`}
                  >
                    <span>{char}</span>
                    <span className="text-[9px] text-[#8b949e] font-sans font-normal">{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isGameActive && hasErrorState && (
          <div className="mb-4 p-2.5 rounded-md bg-[rgba(248,81,73,0.1)] border border-[#f85149]/40 text-[#f85149] text-xs font-mono text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Wrong key pressed! Incurred +0.5s penalty. Press target key &apos;{sequence[currentIndex]}&apos;</span>
          </div>
        )}

        {isGameActive && (
          <div className="flex items-center justify-between text-xs text-[#8b949e] pt-2 border-t border-[#30363d]">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              FOCUS LOCKED
            </span>
            <span className="font-mono">Target: <strong className="text-white uppercase">{sequence[currentIndex]}</strong></span>
          </div>
        )}

        {isCompleted && finalScoreDetails && (
          <div className="mt-4 p-6 rounded-md bg-[#0d1117] border border-[#30363d] text-center">
            {finalScoreDetails.isNewPB ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(210,153,34,0.15)] border border-[#d29922] text-[#d29922] font-semibold text-xs mb-4">
                <Trophy className="w-4 h-4" />
                <span>NEW PERSONAL BEST RECORD!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(88,166,255,0.15)] border border-[#58a6ff] text-[#58a6ff] font-semibold text-xs mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>Game Completed Successfully</span>
              </div>
            )}

            <div className="max-w-md mx-auto grid grid-cols-3 gap-2 my-4 text-left font-mono">
              <div className="p-3 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[10px] text-[#8b949e] font-sans uppercase block">Raw Duration</span>
                <span className="text-base font-bold text-white">{finalScoreDetails.rawDuration.toFixed(2)}s</span>
              </div>
              <div className="p-3 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[10px] text-[#8b949e] font-sans uppercase block">Penalty</span>
                <span className="text-base font-bold text-[#f85149]">+{finalScoreDetails.penaltyTime.toFixed(2)}s</span>
              </div>
              <div className="p-3 rounded-md bg-[#161b22] border border-[#58a6ff]/50">
                <span className="text-[10px] text-[#58a6ff] font-sans uppercase block">Final Score</span>
                <span className="text-base font-bold text-[#58a6ff]">{finalScoreDetails.finalScore.toFixed(2)}s</span>
              </div>
            </div>

            {token ? (
              <p className="text-xs text-[#3fb950] mb-4">
                {isSubmitting ? 'Saving to server...' : saveError ? `Save error: ${saveError}` : '✓ Transmitted to global database'}
              </p>
            ) : (
              <p className="text-xs text-[#8b949e] mb-4">
                Sign in to save scores to the global leaderboard.
              </p>
            )}

            <button
              onClick={startGame}
              className="px-5 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold border border-[#30363d] flex items-center gap-2 mx-auto transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
