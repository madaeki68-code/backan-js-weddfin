import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaModule } from '../src/database/prisma.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { AuthModule } from '../src/modules/auth/auth.module.js';
import { LeadsModule } from '../src/modules/leads/leads.module.js';
import { ClientsModule } from '../src/modules/clients/clients.module.js';
import { ProjectsModule } from '../src/modules/projects/projects.module.js';
import { PackagesModule } from '../src/modules/packages/packages.module.js';
import { AddOnsModule } from '../src/modules/add-ons/add-ons.module.js';
import { TeamMembersModule } from '../src/modules/team-members/team-members.module.js';
import { FinanceModule } from '../src/modules/finance/finance.module.js';
import { ProjectTeamAssignmentsModule } from '../src/modules/project-team-assignments/project-team-assignments.module.js';
import { GalleriesModule } from '../src/modules/galleries/galleries.module.js';
import { ProfileModule } from '../src/modules/profile/profile.module.js';
import { ClientFeedbackModule } from '../src/modules/client-feedback/client-feedback.module.js';
import { ProfileSettingsModule } from '../src/modules/profile-settings/profile-settings.module.js';
import { CalendarModule } from '../src/modules/calendar/calendar.module.js';
import { TeamPaymentsModule } from '../src/modules/team-payments/team-payments.module.js';
import { StorageModule } from '../src/modules/storage/storage.module.js';

describe('Authentication HTTP flow', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  const passwordHash = bcrypt.hashSync('local-test-password', 4);
  const user = {
    id: 'c4de2f80-5dd6-4c80-a45b-4f169965fda1',
    email: 'auth-test@example.com',
    passwordHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    profile: {
      id: 'c4de2f80-5dd6-4c80-a45b-4f169965fda1',
      businessName: 'Test Studio',
      ownerName: 'Test Owner',
    },
  };
  const prisma = {
    sessions: new Map<string, { id: string; userId: string; refreshTokenHash: string; expiresAt: Date }>(),
    userLoginSession: {
      create: vi.fn(async ({ data }: { data: { id: string; userId: string; refreshTokenHash: string; expiresAt: Date } }) => {
        prisma.sessions.set(data.id, data);
        return data;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => prisma.sessions.get(where.id) ?? null),
      deleteMany: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => ({
        count: prisma.sessions.get(where.id)?.userId === where.userId && prisma.sessions.delete(where.id) ? 1 : 0,
      })),
    },
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id === user.id || where.email === user.email) return user;
        return null;
      }),
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'local-auth-integration-test-secret', NODE_ENV: 'test' })],
        }),
        PrismaModule,
        AuthModule,
        LeadsModule,
        ClientsModule,
        ProjectsModule,
        PackagesModule,
        AddOnsModule,
        TeamMembersModule,
        FinanceModule,
        ProjectTeamAssignmentsModule,
        GalleriesModule,
        ProfileModule,
        ClientFeedbackModule,
        ProfileSettingsModule,
        CalendarModule,
        TeamPaymentsModule,
        StorageModule,
      ],
    }).overrideProvider(PrismaService).useValue(prisma).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    jwt = app.get(JwtService);
  });

  afterAll(async () => app.close());

  it('logs in, sets an HttpOnly cookie, restores the user, then clears the session on logout', async () => {
    const client = request.agent(app.getHttpServer());
    const login = await client
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({ email: user.email, password: 'local-test-password' })
      .expect(201);

    expect(login.body.user).toMatchObject({ id: user.id, email: user.email, role: 'admin' });
    expect(login.body.accessToken).toBeUndefined();
    const setCookie = login.headers['set-cookie'][0] as string;
    const originalSessionCookie = setCookie.split(';')[0];
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/api/v1');
    expect(setCookie).not.toContain('Secure');
    const restored = await client
      .get('/api/v1/auth/me')
      .expect(200);
    expect(restored.body).toMatchObject({ id: user.id, email: user.email, role: 'admin' });
    expect(restored.body.passwordHash).toBeUndefined();

    const logout = await client
      .post('/api/v1/auth/logout')
      .set('Origin', 'http://localhost:3000')
      .expect(201);
    expect(logout.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    await client.get('/api/v1/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', originalSessionCookie)
      .expect(401);
  });

  it('rejects expired JWT cookies', async () => {
    const expiredToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '-1s' },
    );
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', `attera_session=${expiredToken}`)
      .expect(401);
  });

  it('protects core data APIs with the session guard', async () => {
    const routes = [
      '/api/v1/leads', '/api/v1/clients', '/api/v1/projects', '/api/v1/packages',
      '/api/v1/add-ons', '/api/v1/team-members', '/api/v1/cards', '/api/v1/pockets',
      '/api/v1/transactions', '/api/v1/project-team-assignments?projectId=none', '/api/v1/galleries',
      '/api/v1/profile/me', '/api/v1/client-feedback', '/api/v1/profile-settings', '/api/v1/calendar/events',
      '/api/v1/team-project-payments', '/api/v1/team-payment-records',
      '/api/v1/storage/assets/00000000-0000-4000-8000-000000000000',
    ];
    for (const route of routes) {
      await request(app.getHttpServer()).get(route).expect(401);
    }
    await request(app.getHttpServer()).post('/api/v1/calendar/google-feed').send({ action: 'create' }).expect(401);
  });
});
