import { PartialType } from '@nestjs/mapped-types';
import { CreatePocketDto } from './create-pocket.dto.js';

export class UpdatePocketDto extends PartialType(CreatePocketDto) {}
