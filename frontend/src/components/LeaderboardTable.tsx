'use client';

import React, { useEffect, useState } from 'react';
import { fetchGraphQL } from '../lib/graphql-client';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  bestTime: number;
  wrongAttempts: number;
  penaltyTime: number;
  createdAt: string;
}

const GET_LEADERBOARD_QUERY = /* GraphQL */ `
  query GetLeaderboard {
    getLeaderboard {
      id
      userId
      username
      bestTime
      wrongAttempts
      penaltyTime
      createdAt
    }
  }
`;

export const LeaderboardTable: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGraphQL<{ getLeaderboard: LeaderboardEntry[] }>(GET_LEADERBOARD_QUERY);
      setEntries(data.getLeaderboard || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#d29922]" />
            <span>Global Leaderboard</span>
          </h2>
          <p className="text-xs text-[#8b949e] mt-0.5">Top players ranked by total completion score</p>
        </div>
        <button
          onClick={loadLeaderboard}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium border border-[#30363d] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 panel rounded-lg text-center text-xs text-[#8b949e]">
          Loading global rankings...
        </div>
      ) : error ? (
        <div className="p-6 panel rounded-lg text-center text-xs text-[#f85149]">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 panel rounded-lg text-center text-xs text-[#8b949e]">
          No scores logged yet. Play a game to claim #1!
        </div>
      ) : (
        <div className="panel rounded-lg overflow-hidden border border-[#30363d]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#0d1117] text-[#8b949e] uppercase font-mono font-semibold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Best Score</th>
                  <th className="py-3 px-4">Penalties</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]/60 font-mono">
                {entries.map((entry, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={entry.id} className="hover:bg-[#21262d]/50 transition-colors">
                      <td className="py-3 px-4 text-[#8b949e] font-bold">
                        #{rank}
                      </td>
                      <td className="py-3 px-4 text-white font-sans font-medium">
                        {entry.username}
                      </td>
                      <td className="py-3 px-4 text-[#58a6ff] font-bold">
                        {entry.bestTime.toFixed(3)}s
                      </td>
                      <td className="py-3 px-4 text-[#8b949e]">
                        {entry.wrongAttempts} errors (+{entry.penaltyTime.toFixed(2)}s)
                      </td>
                      <td className="py-3 px-4 text-[#8b949e] font-sans">
                        {new Date(entry.createdAt).toLocaleDateString()}
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
