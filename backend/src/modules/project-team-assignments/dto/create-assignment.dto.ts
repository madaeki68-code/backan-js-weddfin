import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsString() projectId: string;
  @IsString() teamMemberId: string;
  @IsString() @MaxLength(100) assignedRole: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) agreedFee?: number;
  @IsOptional() @IsBoolean() isConfirmed?: boolean;
  @IsOptional() @IsString() notes?: string;
}
