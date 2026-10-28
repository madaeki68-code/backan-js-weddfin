import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ProfileSettingsService } from './profile-settings.service.js';
import { UpsertSettingDto } from './dto/upsert-setting.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('profile-settings')
export class ProfileSettingsController {
  constructor(private readonly service: ProfileSettingsService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.service.list(req.user.profile?.id || req.user.id); }
  @Get(':key') get(@Req() req: AuthenticatedRequest, @Param('key') key: string) { return this.service.get(req.user.profile?.id || req.user.id, key); }
  @Put(':key') upsert(@Req() req: AuthenticatedRequest, @Param('key') key: string, @Body() dto: UpsertSettingDto) {
    return this.service.upsert(req.user.profile?.id || req.user.id, key, dto.value);
  }
  @Delete(':key') remove(@Req() req: AuthenticatedRequest, @Param('key') key: string) { return this.service.remove(req.user.profile?.id || req.user.id, key); }
}
