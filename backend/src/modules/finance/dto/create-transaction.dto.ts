import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString() date: string;
  @IsString() description: string;
  @Type(() => Number) @IsNumber() @Min(0.01) amount: number;
  @IsIn(['Pemasukan', 'Pengeluaran', 'income', 'expense', 'transfer']) type: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() @MaxLength(100) category?: string;
  @IsOptional() @IsString() @MaxLength(50) method?: string;
  @IsOptional() @IsString() pocketId?: string;
  @IsOptional() @IsString() cardId?: string;
  @IsOptional() @IsString() @MaxLength(100) printingItemId?: string;
  @IsOptional() @IsString() @MaxLength(100) sourceId?: string;
  @IsOptional() @IsString() @MaxLength(255) clientName?: string;
  @IsOptional() @IsString() proofUrl?: string;
  @IsOptional() @IsString() vendorSignature?: string;
}
