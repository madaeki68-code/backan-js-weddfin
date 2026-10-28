import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class TeamPaymentRecordDto {
  @IsOptional() @IsString() recordNumber?: string;
  @IsOptional() @IsUUID() teamMemberId?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(500) @IsUUID(undefined, { each: true }) projectPaymentIds?: string[];
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalAmount?: number;
  @IsOptional() @IsString() vendorSignature?: string;
}

export class CreateTeamPaymentRecordDto extends TeamPaymentRecordDto {
  @IsString() recordNumber = '';
  @IsDateString() date = '';
  @IsArray() @ArrayMaxSize(500) @IsUUID(undefined, { each: true }) projectPaymentIds: string[] = [];
  @Type(() => Number) @IsNumber() @Min(0) totalAmount = 0;
}
