import { createSchema } from 'graphql-yoga';
import { GraphQLContext } from './context.js';
import { hashPassword, comparePassword, generateToken } from './utils/auth.js';

export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    gameResults: [GameResult!]!
  }

  type GameResult {
    id: ID!
    userId: String!
    user: User
    totalTime: Float!
    correctChars: Int!
    wrongAttempts: Int!
    penaltyTime: Float!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type LeaderboardEntry {
    id: ID!
    userId: String!
    username: String!
    bestTime: Float!
    wrongAttempts: Int!
    penaltyTime: Float!
    createdAt: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    usernameOrEmail: String!
    password: String!
  }

  input SaveGameResultInput {
    rawDuration: Float!
    wrongAttempts: Int!
    correctChars: Int
  }

  type Query {
    me: User
    getUserGameHistory: [GameResult!]!
    getUserBestScore: GameResult
    getLeaderboard: [LeaderboardEntry!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    saveGameResult(input: SaveGameResultInput!): GameResult!
  }
`;

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new Error('Unauthorized: Authentication required');
      }
      const user = await context.prisma.user.findUnique({
        where: { id: context.currentUser.userId },
        include: { gameResults: true },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },

    getUserGameHistory: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new Error('Unauthorized: Authentication required');
      }
      return context.prisma.gameResult.findMany({
        where: { userId: context.currentUser.userId },
        orderBy: { createdAt: 'desc' },
      });
    },

    getUserBestScore: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new Error('Unauthorized: Authentication required');
      }
      const best = await context.prisma.gameResult.findFirst({
        where: { userId: context.currentUser.userId },
        orderBy: { totalTime: 'asc' },
      });
      return best;
    },

    getLeaderboard: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const results = await context.prisma.gameResult.findMany({
        include: {
          user: {
            select: { username: true },
          },
        },
        orderBy: { totalTime: 'asc' },
      });

      const userBestMap = new Map<string, typeof results[0]>();
      for (const res of results) {
        if (!userBestMap.has(res.userId)) {
          userBestMap.set(res.userId, res);
        }
      }

      const leaderboardEntries = Array.from(userBestMap.values()).map((res) => ({
        id: res.id,
        userId: res.userId,
        username: res.user?.username || 'Unknown',
        bestTime: parseFloat(res.totalTime.toFixed(3)),
        wrongAttempts: res.wrongAttempts,
        penaltyTime: parseFloat(res.penaltyTime.toFixed(3)),
        createdAt: res.createdAt.toISOString(),
      }));

      return leaderboardEntries.sort((a, b) => a.bestTime - b.bestTime);
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      { input }: { input: { username: string; email: string; password: string } },
      context: GraphQLContext
    ) => {
      const { username, email, password } = input;

      if (!username || username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      if (!email || !email.includes('@')) {
        throw new Error('Valid email address is required');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const existingUser = await context.prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        throw new Error('Username or Email is already registered');
      }

      const passwordHash = await hashPassword(password);
      const user = await context.prisma.user.create({
        data: {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
        },
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      return { token, user };
    },

    login: async (
      _parent: unknown,
      { input }: { input: { usernameOrEmail: string; password: string } },
      context: GraphQLContext
    ) => {
      const { usernameOrEmail, password } = input;

      const user = await context.prisma.user.findFirst({
        where: {
          OR: [
            { username: usernameOrEmail.trim() },
            { email: usernameOrEmail.trim().toLowerCase() },
          ],
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      return { token, user };
    },

    saveGameResult: async (
      _parent: unknown,
      { input }: { input: { rawDuration: number; wrongAttempts: number; correctChars?: number } },
      context: GraphQLContext
    ) => {
      if (!context.currentUser) {
        throw new Error('Unauthorized: You must be logged in to save game scores');
      }

      const rawDuration = Math.max(0, input.rawDuration);
      const wrongAttempts = Math.max(0, input.wrongAttempts);
      const correctChars = input.correctChars || 20;

      const penaltyTime = parseFloat((wrongAttempts * 0.5).toFixed(3));
      const totalTime = parseFloat((rawDuration + penaltyTime).toFixed(3));

      const gameResult = await context.prisma.gameResult.create({
        data: {
          userId: context.currentUser.userId,
          totalTime,
          correctChars,
          wrongAttempts,
          penaltyTime,
        },
        include: {
          user: true,
        },
      });

      return gameResult;
    },
  },
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});
