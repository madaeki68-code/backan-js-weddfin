import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(100) role: string;
  @IsString() @MaxLength(50) phone: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) standardFee?: number;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() @MaxLength(100) noRek?: string;
  @IsOptional() @IsString() @MaxLength(100) bankName?: string;
  @IsOptional() @IsString() specialization?: string;
  @IsOptional() @IsString() @MaxLength(255) location?: string;
  @IsOptional() @IsString() @MaxLength(100) emergencyContact?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) rating?: number;
  @IsOptional() @IsArray() performanceNotes?: unknown[];
  @IsOptional() @IsString() portalAccessId?: string;
  @IsOptional() @IsString() @MaxLength(50) category?: string;
  @IsOptional() @IsString() @MaxLength(50) status?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
