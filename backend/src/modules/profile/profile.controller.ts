import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}
  @Get('me') get(@Req() req: AuthenticatedRequest) { return this.service.get(req.user.profile?.id || req.user.id); }
  @Patch('me') update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) { return this.service.update(req.user.profile?.id || req.user.id, dto); }
}
