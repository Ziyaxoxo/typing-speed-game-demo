'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { fetchGraphQL } from '../../lib/graphql-client';
import { UserPlus, Lock, User, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGraphQL<{ register: { token: string; user: { id: string; username: string; email: string } } }>(
        REGISTER_MUTATION,
        {
          input: {
            username,
            email,
            password,
          },
        }
      );

      login(data.register.token, data.register.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="panel p-6 sm:p-8 border-[#30363d] bg-[#161b22]">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto mb-3 text-[#3fb950]">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Create Account</h1>
          <p className="text-xs text-[#8b949e] mt-1">Register to start logging game scores</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[rgba(248,81,73,0.1)] border border-[#f85149]/40 flex items-center gap-2 text-[#f85149] text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="speedtyper"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
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
                placeholder="At least 6 characters"
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
          <span>Already registered? </span>
          <Link href="/login" className="font-semibold text-[#58a6ff] hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
