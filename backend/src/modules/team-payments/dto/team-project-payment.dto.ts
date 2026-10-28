import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class TeamProjectPaymentDto {
  @IsOptional() @IsUUID() id?: string;
  @IsUUID() teamMemberId: string;
  @IsString() teamMemberName: string;
  @IsDateString() date: string;
  @IsIn(['Paid', 'Unpaid']) status: 'Paid' | 'Unpaid';
  @Type(() => Number) @IsNumber() @Min(0) fee: number;
}

export class ReconcileTeamPaymentsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => TeamProjectPaymentDto)
  items: TeamProjectPaymentDto[];
}

export class UpdateTeamProjectPaymentDto {
  @IsOptional() @IsIn(['Paid', 'Unpaid']) status?: 'Paid' | 'Unpaid';
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) fee?: number;
}
