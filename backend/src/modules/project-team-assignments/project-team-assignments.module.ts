import { Module } from '@nestjs/common';
import { ProjectTeamAssignmentsController } from './project-team-assignments.controller.js';
import { ProjectTeamAssignmentsService } from './project-team-assignments.service.js';

@Module({ controllers: [ProjectTeamAssignmentsController], providers: [ProjectTeamAssignmentsService], exports: [ProjectTeamAssignmentsService] })
export class ProjectTeamAssignmentsModule {}
