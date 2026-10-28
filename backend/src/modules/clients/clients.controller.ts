import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: Record<string, string>) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.clientsService.findAll(profileId, {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.clientsService.findOne(id, profileId);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateClientDto) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.clientsService.create(profileId, dto);
  }

  @Patch(':id')
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.clientsService.update(id, profileId, dto);
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const profileId = req.user.profile?.id || req.user.id;
    return this.clientsService.remove(id, profileId);
  }
}
