import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AUTH_TOKEN_TTL_SECONDS } from './auth.constants.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda dinonaktifkan');
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + AUTH_TOKEN_TTL_SECONDS * 1000);
    await this.prisma.userLoginSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshTokenHash: hashSessionId(sessionId),
        expiresAt,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, jti: sessionId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async revokeSession(userId: string, sessionId?: string) {
    if (sessionId) await this.prisma.userLoginSession.deleteMany({ where: { id: sessionId, userId } });
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
    };
  }
}

export function hashSessionId(sessionId: string) {
  return createHash('sha256').update(sessionId).digest('hex');
}
