'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { Trophy, Zap, LogOut, LogIn, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, personalBest, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#58a6ff] group-hover:border-[#58a6ff] transition-colors">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-mono">
            typing<span className="text-[#58a6ff]">dash</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive('/dashboard') || isActive('/')
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/game"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive('/game')
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>Play</span>
          </Link>

          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive('/leaderboard')
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#d29922]" />
            <span>Leaderboard</span>
          </Link>
        </nav>

        {/* User / PB */}
        <div className="flex items-center gap-3">
          {personalBest !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d] text-[#d29922] text-xs font-mono">
              <Trophy className="w-3 h-3" />
              <span>PB: {personalBest.toFixed(2)}s</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#c9d1d9] bg-[#161b22] px-2.5 py-1 rounded-md border border-[#30363d]">
                {user.username}
              </span>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f85149] hover:bg-[#161b22] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#58a6ff]" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
