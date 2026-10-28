import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { TeamMembersService } from './team-members.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly service: TeamMembersService) {}
  @Get() findAll(@Req() req: AuthenticatedRequest, @Query('search') search?: string, @Query('activeOnly') active?: string) {
    return this.service.findAll(req.user.profile?.id || req.user.id, { search, activeOnly: active === 'true' });
  }
  @Get(':id') findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.findOne(id, req.user.profile?.id || req.user.id);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTeamMemberDto) {
    return this.service.create(req.user.profile?.id || req.user.id, dto);
  }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.service.update(id, req.user.profile?.id || req.user.id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(id, req.user.profile?.id || req.user.id);
  }
}
