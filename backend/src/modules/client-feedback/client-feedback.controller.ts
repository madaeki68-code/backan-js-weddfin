import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ClientFeedbackService } from './client-feedback.service.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { UpdateFeedbackDto } from './dto/update-feedback.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('client-feedback')
export class ClientFeedbackController {
  constructor(private readonly service: ClientFeedbackService) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query('projectId') projectId?: string) { return this.service.list(req.user.profile?.id || req.user.id, projectId); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateFeedbackDto) { return this.service.create(req.user.profile?.id || req.user.id, dto); }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateFeedbackDto) { return this.service.update(id, req.user.profile?.id || req.user.id, dto); }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.remove(id, req.user.profile?.id || req.user.id); }
}
