import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(255) businessName?: string;
  @IsOptional() @IsString() @MaxLength(255) ownerName?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() @MaxLength(100) instagramHandle?: string;
  @IsOptional() @IsString() websiteUrl?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.5) mobileUiScale?: number;
  @IsOptional() @IsArray() leadSources?: unknown[];
}
