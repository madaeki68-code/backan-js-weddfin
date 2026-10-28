import type { NextFunction, Request, Response } from 'express';
import { createCsrfOriginMiddleware } from './csrf-origin.middleware.js';

function runMiddleware(
  middleware: ReturnType<typeof createCsrfOriginMiddleware>,
  input: { method: string; path?: string; origin?: string; referer?: string; cookie?: string; authorization?: string },
) {
  const next = vi.fn() as unknown as NextFunction;
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const request = {
    method: input.method,
    path: input.path || '/api/v1/clients',
    headers: {
      origin: input.origin,
      referer: input.referer,
      cookie: input.cookie,
      authorization: input.authorization,
    },
  } as unknown as Request;

  middleware(request, response, next);
  return { next, response };
}

describe('cookie CSRF origin middleware', () => {
  const middleware = createCsrfOriginMiddleware(['http://localhost:3000']);

  it('does not interfere with safe read requests', () => {
    const { next, response } = runMiddleware(middleware, {
      method: 'GET', cookie: 'attera_session=session-value',
    });
    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it('blocks cookie-authenticated mutations from an untrusted origin', () => {
    const { next, response } = runMiddleware(middleware, {
      method: 'PATCH', cookie: 'attera_session=session-value', origin: 'https://attacker.example',
    });
    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a cookie-authenticated mutation from an allowlisted origin', () => {
    const { next } = runMiddleware(middleware, {
      method: 'PATCH', cookie: 'attera_session=session-value', origin: 'http://localhost:3000',
    });
    expect(next).toHaveBeenCalledOnce();
  });

  it('protects login CSRF and rejects requests with no verifiable origin', () => {
    const { next, response } = runMiddleware(middleware, {
      method: 'POST', path: '/api/v1/auth/login',
    });
    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts an allowlisted Referer when Origin is absent', () => {
    const { next } = runMiddleware(middleware, {
      method: 'POST', path: '/api/v1/auth/login', referer: 'http://localhost:3000/login',
    });
    expect(next).toHaveBeenCalledOnce();
  });

  it('does not apply cookie CSRF checks to Bearer-authenticated API clients', () => {
    const { next } = runMiddleware(middleware, {
      method: 'PATCH',
      cookie: 'attera_session=session-value',
      authorization: 'Bearer api-token',
      origin: 'https://attacker.example',
    });
    expect(next).toHaveBeenCalledOnce();
  });
});
