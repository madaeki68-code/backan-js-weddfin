import { PartialType } from '@nestjs/mapped-types';
import { CreateAddOnDto } from './create-add-on.dto.js';

export class UpdateAddOnDto extends PartialType(CreateAddOnDto) {}
