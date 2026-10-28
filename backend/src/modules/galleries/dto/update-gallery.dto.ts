import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryDto } from './create-gallery.dto.js';

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}
