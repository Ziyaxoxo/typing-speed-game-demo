'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { fetchGraphQL } from '../lib/graphql-client';
import { History, Calendar } from 'lucide-react';

interface GameResult {
  id: string;
  totalTime: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyTime: number;
  createdAt: string;
}

const GET_USER_GAME_HISTORY_QUERY = /* GraphQL */ `
  query GetUserGameHistory {
    getUserGameHistory {
      id
      totalTime
      correctChars
      wrongAttempts
      penaltyTime
      createdAt
    }
  }
`;

export const UserHistoryTable: React.FC = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchGraphQL<{ getUserGameHistory: GameResult[] }>(GET_USER_GAME_HISTORY_QUERY, {}, token)
      .then((data) => {
        setHistory(data.getUserGameHistory || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-[#58a6ff]" />
          <span>Your Performance History</span>
        </h3>
        <span className="text-xs text-[#8b949e] font-mono">{history.length} games logged</span>
      </div>

      {isLoading ? (
        <div className="p-6 panel rounded-lg text-center text-xs text-[#8b949e]">
          Loading performance history...
        </div>
      ) : error ? (
        <div className="p-4 panel rounded-lg text-center text-xs text-[#f85149]">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="p-6 panel rounded-lg text-center text-xs text-[#8b949e]">
          No game attempts recorded yet.
        </div>
      ) : (
        <div className="panel rounded-lg overflow-hidden border border-[#30363d]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#0d1117] text-[#8b949e] uppercase font-mono font-semibold">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Final Score</th>
                  <th className="py-2.5 px-4">Raw Time</th>
                  <th className="py-2.5 px-4">Errors / Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60 font-mono">
                {history.map((item) => {
                  const rawDuration = item.totalTime - item.penaltyTime;
                  return (
                    <tr key={item.id} className="hover:bg-[#21262d]/40">
                      <td className="py-2.5 px-4 text-[#8b949e] font-sans flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#8b949e]" />
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#58a6ff]">
                        {item.totalTime.toFixed(3)}s
                      </td>
                      <td className="py-2.5 px-4 text-white">
                        {rawDuration.toFixed(3)}s
                      </td>
                      <td className="py-2.5 px-4 text-[#8b949e]">
                        {item.wrongAttempts} wrong (+{item.penaltyTime.toFixed(2)}s)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
