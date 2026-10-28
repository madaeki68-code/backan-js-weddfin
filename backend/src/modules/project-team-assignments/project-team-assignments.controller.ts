import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ProjectTeamAssignmentsService } from './project-team-assignments.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from './dto/update-assignment.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('project-team-assignments')
export class ProjectTeamAssignmentsController {
  constructor(private readonly service: ProjectTeamAssignmentsService) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query('projectId') projectId: string) {
    return this.service.list(req.user.profile?.id || req.user.id, projectId);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAssignmentDto) {
    return this.service.create(req.user.profile?.id || req.user.id, dto);
  }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.service.update(id, req.user.profile?.id || req.user.id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(id, req.user.profile?.id || req.user.id);
  }
}
