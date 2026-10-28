import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    sessionId?: string;
    role: string;
    isActive: boolean;
    profile?: { id: string } | null;
  };
};
