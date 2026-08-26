'use client';

import React from 'react';
import { TypingEngine } from '../../components/TypingEngine';
import { Zap } from 'lucide-react';

export default function GamePage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto mb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          <Zap className="w-7 h-7 text-emerald-400 animate-pulse" />
          <span>Typing Speed Challenge</span>
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Focus lock is programmatically maintained. Type each character accurately; mistakes add 0.5s to your score.
        </p>
      </div>

      <TypingEngine />
    </div>
  );
}
