'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { fetchGraphQL } from '../../lib/graphql-client';
import { LogIn, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGraphQL<{ login: { token: string; user: { id: string; username: string; email: string } } }>(
        LOGIN_MUTATION,
        {
          input: {
            usernameOrEmail,
            password,
          },
        }
      );

      login(data.login.token, data.login.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="panel p-6 sm:p-8 border-[#30363d] bg-[#161b22]">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto mb-3 text-[#58a6ff]">
            <LogIn className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Account Sign In</h1>
          <p className="text-xs text-[#8b949e] mt-1">Authenticate to persist game scores to global leaderboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[rgba(248,81,73,0.1)] border border-[#f85149]/40 flex items-center gap-2 text-[#f85149] text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="username or email@domain.com"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="font-semibold text-[#58a6ff] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
