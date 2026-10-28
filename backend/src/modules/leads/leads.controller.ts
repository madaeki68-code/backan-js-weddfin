import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';

const publicInquiryTimestamps = new Map<string, number[]>();
const PUBLIC_INQUIRY_LIMIT = 5;
const PUBLIC_INQUIRY_WINDOW_MS = 10 * 60 * 1000;

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('public/:profileId')
  async createPublic(
    @Param('profileId') profileId: string,
    @Body() dto: CreateLeadDto,
    @Req() req: { ip?: string; socket?: { remoteAddress?: string } },
  ) {
    const now = Date.now();
    const key = `${profileId}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const recent = (publicInquiryTimestamps.get(key) || []).filter((timestamp) => now - timestamp < PUBLIC_INQUIRY_WINDOW_MS);
    if (recent.length >= PUBLIC_INQUIRY_LIMIT) {
      throw new HttpException('Terlalu banyak permintaan. Coba lagi nanti.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    publicInquiryTimestamps.set(key, recent);
    return this.leadsService.createPublic(profileId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: Record<string, string>) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.leadsService.findAll(profileId, {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
      activeOnly: query.activeOnly === 'true',
      eventDateFrom: query.eventDateFrom,
      eventDateTo: query.eventDateTo,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.leadsService.findOne(id, profileId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateLeadDto) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.leadsService.create(profileId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.leadsService.update(id, profileId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.leadsService.remove(id, profileId);
  }
}
