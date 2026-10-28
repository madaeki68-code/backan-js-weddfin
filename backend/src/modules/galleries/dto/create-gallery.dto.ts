import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGalleryDto {
  @IsString() projectId: string;
  @IsString() @MaxLength(255) slug: string;
  @IsOptional() @IsString() @MaxLength(50) accessCode?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsBoolean() downloadAllowed?: boolean;
}
