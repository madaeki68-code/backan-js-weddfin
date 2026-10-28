import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGalleryItemDto {
  @IsString() galleryId: string;
  @IsString() @MaxLength(255) fileName: string;
  @IsString() filePath: string;
  @IsOptional() @IsString() thumbnailPath?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) fileSizeBytes?: number;
  @IsOptional() @IsString() @MaxLength(100) mimeType?: string;
  @IsOptional() @IsString() @MaxLength(100) category?: string;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isClientFavorite?: boolean;
}
