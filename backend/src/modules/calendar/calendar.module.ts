import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller.js';
import { CalendarService } from './calendar.service.js';
import { GoogleCalendarFeedAdminController, GoogleCalendarFeedPublicController } from './google-calendar-feed.controller.js';
import { GoogleCalendarFeedService } from './google-calendar-feed.service.js';

@Module({ controllers: [CalendarController, GoogleCalendarFeedAdminController, GoogleCalendarFeedPublicController], providers: [CalendarService, GoogleCalendarFeedService] })
export class CalendarModule {}
