import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { GoogleFeedActionDto } from './dto/google-feed-action.dto.js';
import { GoogleCalendarFeedService } from './google-calendar-feed.service.js';

@UseGuards(JwtAuthGuard)
@Controller('calendar/google-feed')
export class GoogleCalendarFeedAdminController {
  constructor(private readonly service: GoogleCalendarFeedService) {}
  @Post() manage(@Req() req: AuthenticatedRequest, @Body() dto: GoogleFeedActionDto) {
    return this.service.manage(req.user.profile?.id || req.user.id, req.user.id, req.user.role, dto.action);
  }
}

@Controller('calendar/google-feed/feed')
export class GoogleCalendarFeedPublicController {
  constructor(private readonly service: GoogleCalendarFeedService) {}
  @Get() async get(@Query('token') token: string, @Res() response: Response) {
    const body = await this.service.feed(token || '');
    response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    response.setHeader('Content-Disposition', 'inline; filename=vena-calendar.ics');
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.status(200).send(body);
  }
}
