import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCardDto {
  @IsOptional() @IsString() @MaxLength(150) name?: string;
  @IsOptional() @IsString() @MaxLength(150) cardHolderName?: string;
  @IsString() @MaxLength(100) bankName: string;
  @IsOptional() @IsString() @MaxLength(50) cardType?: string;
  @IsOptional() @IsString() @MaxLength(4) lastFourDigits?: string;
  @IsOptional() @IsString() @MaxLength(10) expiryDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) balance?: number;
  @IsOptional() @IsString() @MaxLength(100) colorGradient?: string;
}
