import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePocketDto {
  @IsString() @MaxLength(150) name: string;
  @IsString() @MaxLength(50) type: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(50) icon?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amount?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) goalAmount?: number;
  @IsOptional() @IsString() lockEndDate?: string;
  @IsOptional() @IsString() sourceCardId?: string;
  @IsOptional() @IsArray() members?: unknown[];
}
