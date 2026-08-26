'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchGraphQL } from './graphql-client';
import { getLocalPersonalBest, saveLocalPersonalBest } from './game-utils';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  personalBest: number | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updatePersonalBest: (score: number) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      username
      email
    }
    getUserBestScore {
      totalTime
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const localPB = getLocalPersonalBest();
    setPersonalBest(localPB);

    if (savedToken) {
      setToken(savedToken);
      fetchGraphQL<{ me: User; getUserBestScore: { totalTime: number } | null }>(ME_QUERY, {}, savedToken)
        .then((data) => {
          if (data.me) {
            setUser(data.me);
            if (data.getUserBestScore?.totalTime) {
              const serverPB = data.getUserBestScore.totalTime;
              if (localPB === null || serverPB < localPB) {
                saveLocalPersonalBest(serverPB);
                setPersonalBest(serverPB);
              }
            }
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    refreshUserData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updatePersonalBest = (score: number): boolean => {
    const isNewPB = saveLocalPersonalBest(score);
    if (isNewPB || personalBest === null || score < personalBest) {
      setPersonalBest(score);
      return true;
    }
    return false;
  };

  const refreshUserData = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;
    try {
      const data = await fetchGraphQL<{ me: User; getUserBestScore: { totalTime: number } | null }>(ME_QUERY, {}, savedToken);
      if (data.me) setUser(data.me);
      if (data.getUserBestScore?.totalTime) {
        const serverPB = data.getUserBestScore.totalTime;
        updatePersonalBest(serverPB);
      }
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        personalBest,
        isLoading,
        login,
        logout,
        updatePersonalBest,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
