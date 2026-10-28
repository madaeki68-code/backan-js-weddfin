import { Controller, Get, Param, UseGuards, Req, Post, Body, Patch, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.projectsService.findAll(profileId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.projectsService.findOne(id, profileId);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.profile?.id || req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, req.user.profile?.id || req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.projectsService.remove(id, req.user.profile?.id || req.user.id);
  }
}
