import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';
import { hashSessionId } from './auth.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: (request: { headers: { authorization?: string; cookie?: string } } | null) => {
        if (!request) return null;
        const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (bearerToken) return bearerToken;
        const cookie = request.headers.cookie
          ?.split(';')
          .map((part) => part.trim())
          .find((part) => part.startsWith('attera_session='));
        return cookie ? decodeURIComponent(cookie.slice('attera_session='.length)) : null;
      },
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; jti?: string }) {
    if (!payload.jti) throw new UnauthorizedException('Sesi tidak valid');
    const session = await this.prisma.userLoginSession.findUnique({ where: { id: payload.jti } });
    if (!session || session.userId !== payload.sub || session.expiresAt <= new Date() || session.refreshTokenHash !== hashSessionId(payload.jti)) {
      throw new UnauthorizedException('Sesi tidak aktif');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Akun tidak ditemukan atau tidak aktif');
    }

    return { ...user, sessionId: payload.jti };
  }
}
