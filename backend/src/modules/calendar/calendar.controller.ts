import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { CalendarEventDto, CreateCalendarEventDto } from './dto/calendar-event.dto.js';
import { CalendarService } from './calendar.service.js';

@UseGuards(JwtAuthGuard)
@Controller('calendar/events')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query('from') from?: string, @Query('to') to?: string, @Query('projectId') projectId?: string) {
    return this.service.list(req.user.profile?.id || req.user.id, from, to, projectId);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCalendarEventDto) {
    return this.service.create(req.user.profile?.id || req.user.id, dto);
  }
  @Put(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: CalendarEventDto) {
    return this.service.update(id, req.user.profile?.id || req.user.id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(id, req.user.profile?.id || req.user.id);
  }
}
