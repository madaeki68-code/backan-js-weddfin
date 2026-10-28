import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { LeadsModule } from './modules/leads/leads.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { PackagesModule } from './modules/packages/packages.module.js';
import { AddOnsModule } from './modules/add-ons/add-ons.module.js';
import { TeamMembersModule } from './modules/team-members/team-members.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { ProjectTeamAssignmentsModule } from './modules/project-team-assignments/project-team-assignments.module.js';
import { GalleriesModule } from './modules/galleries/galleries.module.js';
import { ProfileModule } from './modules/profile/profile.module.js';
import { ClientFeedbackModule } from './modules/client-feedback/client-feedback.module.js';
import { ProfileSettingsModule } from './modules/profile-settings/profile-settings.module.js';
import { CalendarModule } from './modules/calendar/calendar.module.js';
import { TeamPaymentsModule } from './modules/team-payments/team-payments.module.js';
import { StorageModule } from './modules/storage/storage.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
