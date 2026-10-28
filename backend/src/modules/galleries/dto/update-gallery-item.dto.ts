import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryItemDto } from './create-gallery-item.dto.js';

export class UpdateGalleryItemDto extends PartialType(CreateGalleryItemDto) {}
