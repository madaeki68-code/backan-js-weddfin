import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController session cookie', () => {
  const authService = {
    login: vi.fn().mockResolvedValue({
      accessToken: 'signed-token',
      user: { id: 'user-1', email: 'owner@example.com', role: 'admin' },
    }),
    revokeSession: vi.fn().mockResolvedValue(undefined),
  };
  const config = { get: vi.fn().mockReturnValue('development') };
  const controller = new AuthController(
    authService as unknown as AuthService,
    config as unknown as ConfigService,
  );
  const response = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response;

  beforeEach(() => vi.clearAllMocks());

  it('sets a bounded HttpOnly cookie and excludes the JWT from the JSON body', async () => {
    await expect(controller.login(
      { email: 'owner@example.com', password: 'secret' },
      response,
    )).resolves.toEqual({ user: { id: 'user-1', email: 'owner@example.com', role: 'admin' } });

    expect(response.cookie).toHaveBeenCalledWith('attera_session', 'signed-token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      path: '/api/v1',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }));
  });

  it('revokes the current server session and clears the same cookie path on logout', async () => {
    await expect(controller.logout({ user: { id: 'user-1', sessionId: 'session-1' } } as never, response)).resolves.toEqual({ loggedOut: true });
    expect(authService.revokeSession).toHaveBeenCalledWith('user-1', 'session-1');
    expect(response.clearCookie).toHaveBeenCalledWith('attera_session', expect.objectContaining({ path: '/api/v1' }));
  });

  it('marks the cookie Secure in production', async () => {
    config.get.mockReturnValueOnce('production');
    await controller.login({ email: 'owner@example.com', password: 'secret' }, response);
    expect(response.cookie).toHaveBeenCalledWith('attera_session', 'signed-token', expect.objectContaining({
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    }));
  });
});
