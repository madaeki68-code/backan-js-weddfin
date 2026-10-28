import { IsIn } from 'class-validator';

export class GoogleFeedActionDto {
  @IsIn(['status', 'create', 'revoke']) action: 'status' | 'create' | 'revoke';
}
