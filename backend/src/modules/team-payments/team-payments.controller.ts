import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ReconcileTeamPaymentsDto, TeamProjectPaymentDto, UpdateTeamProjectPaymentDto } from './dto/team-project-payment.dto.js';
import { CreateTeamPaymentRecordDto, TeamPaymentRecordDto } from './dto/team-payment-record.dto.js';
import { TeamPaymentsService } from './team-payments.service.js';

@UseGuards(JwtAuthGuard)
@Controller('team-project-payments')
export class TeamProjectPaymentsController {
  constructor(private readonly service: TeamPaymentsService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.service.list(req.user.profile?.id || req.user.id); }
  @Get('project/:projectId') listByProject(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.service.listByProject(req.user.profile?.id || req.user.id, projectId);
  }
  @Put('project/:projectId') reconcile(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() dto: ReconcileTeamPaymentsDto) {
    return this.service.reconcile(req.user.profile?.id || req.user.id, projectId, dto);
  }
  @Post('project/:projectId') create(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string, @Body() dto: TeamProjectPaymentDto) {
    return this.service.createPayment(req.user.profile?.id || req.user.id, projectId, dto);
  }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateTeamProjectPaymentDto) {
    return this.service.updatePayment(req.user.profile?.id || req.user.id, id, dto);
  }
  @Delete('project/:projectId') removeProject(@Req() req: AuthenticatedRequest, @Param('projectId') projectId: string) {
    return this.service.deleteProjectPayments(req.user.profile?.id || req.user.id, projectId);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('team-payment-records')
export class TeamPaymentRecordsController {
  constructor(private readonly service: TeamPaymentsService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.service.listRecords(req.user.profile?.id || req.user.id); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTeamPaymentRecordDto) {
    return this.service.createRecord(req.user.profile?.id || req.user.id, dto);
  }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: TeamPaymentRecordDto) {
    return this.service.updateRecord(req.user.profile?.id || req.user.id, id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.deleteRecord(req.user.profile?.id || req.user.id, id);
  }
}
