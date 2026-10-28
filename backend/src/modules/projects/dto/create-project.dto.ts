import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString() clientId: string;
  @IsOptional() @IsString() packageId?: string;
  @IsString() @MaxLength(255) title: string;
  @IsOptional() @IsDateString() eventDate?: string;
  @IsOptional() @IsString() @MaxLength(255) venueName?: string;
  @IsOptional() @IsString() @MaxLength(100) venueCity?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalPackagePrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalAddonPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) discountAmount?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) grandTotal?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amountPaid?: number;
  @IsOptional() @IsString() notes?: string;
}
