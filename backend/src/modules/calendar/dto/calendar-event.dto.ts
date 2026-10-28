import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CalendarEventDto {
  @IsOptional() @IsString() @MaxLength(255) title?: string;
  @IsOptional() @IsString() @MaxLength(80) eventType?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() startAt?: string;
  @IsOptional() @IsString() endAt?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() clientId?: string;
  @IsOptional() @IsUUID() teamMemberId?: string;
  @IsOptional() @IsUUID() vendorId?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() tasks?: unknown[];
}

export class CreateCalendarEventDto extends CalendarEventDto {
  @IsString() @MaxLength(255) override title = '';
  @IsString() @MaxLength(80) override eventType = '';
  @IsDateString() override date = '';
}
