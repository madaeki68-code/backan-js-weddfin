import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamMemberDto } from './create-team-member.dto.js';

export class UpdateTeamMemberDto extends PartialType(CreateTeamMemberDto) {}
