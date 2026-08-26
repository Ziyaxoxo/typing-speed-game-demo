import { PrismaClient } from '@prisma/client';
import { verifyToken, TokenPayload } from './utils/auth.js';

export const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: TokenPayload | null;
}

export async function createContext({ request }: { request: Request }): Promise<GraphQLContext> {
  const authHeader = request.headers.get('authorization');
  let currentUser: TokenPayload | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    currentUser = verifyToken(token);
  }

  return {
    prisma,
    currentUser,
  };
}
