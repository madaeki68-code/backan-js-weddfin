import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SESSION_COOKIE = 'attera_session=';

function toOrigin(value: string | undefined): string | null {
  if (!value || value === 'null') return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function hasSessionCookie(cookieHeader: string | undefined): boolean {
  return Boolean(cookieHeader?.split(';').some((part) => part.trim().startsWith(SESSION_COOKIE)));
}

export function createCsrfOriginMiddleware(allowedOrigins: string[]) {
  const trustedOrigins = new Set(
    allowedOrigins.map((origin) => toOrigin(origin)).filter((origin): origin is string => origin !== null),
  );

  return (request: Request, response: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(request.method.toUpperCase())) {
      next();
      return;
    }

    const authorization = request.headers.authorization;
    const usesBearerToken = typeof authorization === 'string' && /^Bearer\s+\S+$/i.test(authorization);
    const isLoginRequest = request.path === '/api/v1/auth/login';
    if (usesBearerToken || (!isLoginRequest && !hasSessionCookie(request.headers.cookie))) {
      next();
      return;
    }

    const requestOrigin = toOrigin(request.headers.origin) || toOrigin(request.headers.referer);
    if (requestOrigin && trustedOrigins.has(requestOrigin)) {
      next();
      return;
    }

    response.status(403).json({
      success: false,
      error: {
        code: 'CSRF_ORIGIN_REJECTED',
        message: 'Origin tidak diizinkan untuk permintaan ini.',
      },
      timestamp: new Date().toISOString(),
    });
  };
}
