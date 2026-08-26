'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { UserHistoryTable } from '../components/UserHistoryTable';
import { Play, Trophy, Zap, Target, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, personalBest } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Clean Hero Header */}
      <div className="panel p-6 sm:p-8 border-[#30363d] bg-[#161b22]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff] text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Burdenoff Product Engineering Intern Take-Home</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Minimalist 20-Character Typing Speed Test
          </h1>

          <p className="text-[#8b949e] text-sm leading-relaxed mb-6">
            Evaluate typing speed & dexterity with randomized 20-alphabet sequences. Features focus lock, real-time timer starting at 0.00s, and instant +0.5s penalty tracking for incorrect strokes.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/game"
              className="px-5 py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Typing Game</span>
            </Link>

            <Link
              href="/leaderboard"
              className="px-4 py-2.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium text-sm border border-[#30363d] flex items-center gap-2 transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#d29922]" />
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Structured Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Personal Best Card */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#8b949e]">Personal Best</span>
            <Trophy className="w-4 h-4 text-[#d29922]" />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-[#d29922] mb-1">
              {personalBest !== null ? `${personalBest.toFixed(2)}s` : '--'}
            </div>
            <p className="text-[11px] text-[#8b949e]">
              {personalBest !== null ? 'Cached in LocalStorage & synced to PostgreSQL' : 'Complete a game to establish your personal record'}
            </p>
          </div>
        </div>

        {/* Mechanics Card */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#8b949e]">SRS Mechanics</span>
            <Target className="w-4 h-4 text-[#3fb950]" />
          </div>
          <ul className="text-xs text-[#c9d1d9] space-y-1.5 font-sans">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              <span>20 random alphabets [a-z]</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]" />
              <span>+0.5s penalty per wrong attempt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
              <span>Input focus programmatically locked</span>
            </li>
          </ul>
        </div>

        {/* Session Card */}
        <div className="panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#8b949e]">User Session</span>
            <ShieldCheck className="w-4 h-4 text-[#58a6ff]" />
          </div>
          {user ? (
            <div>
              <div className="text-sm font-bold text-white font-mono">{user.username}</div>
              <p className="text-xs text-[#8b949e] mb-2">{user.email}</p>
              <span className="inline-block text-[11px] text-[#3fb950] font-mono">✓ Active JWT Session</span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#8b949e] mb-3">
                Sign in to persist scores to GraphQL PostgreSQL database.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold border border-[#30363d] transition-colors"
              >
                <span>Sign In / Register</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#58a6ff]" />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* User History Table */}
      {user && <UserHistoryTable />}

    </div>
  );
}
