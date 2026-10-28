import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { AddOnsService } from './add-ons.service.js';
import { CreateAddOnDto } from './dto/create-add-on.dto.js';
import { UpdateAddOnDto } from './dto/update-add-on.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('add-ons')
export class AddOnsController {
  constructor(private readonly service: AddOnsService) {}
  @Get() findAll(@Req() req: AuthenticatedRequest, @Query('activeOnly') active?: string) {
    return this.service.findAll(req.user.profile?.id || req.user.id, active === 'true');
  }
  @Get(':id') findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.findOne(id, req.user.profile?.id || req.user.id);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAddOnDto) {
    return this.service.create(req.user.profile?.id || req.user.id, dto);
  }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateAddOnDto) {
    return this.service.update(id, req.user.profile?.id || req.user.id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.remove(id, req.user.profile?.id || req.user.id);
  }
}
