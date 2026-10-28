import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: unknown;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // Jika response sudah terformat atau memiliki property data
        if (res && typeof res === 'object' && ('data' in res || 'success' in res)) {
          const envelope = res as Record<string, unknown>;
          return {
            success: typeof envelope.success === 'boolean' ? envelope.success : true,
            data: (envelope.data ?? res) as T,
            message: typeof envelope.message === 'string' ? envelope.message : undefined,
            meta: envelope.meta,
          };
        }
        return {
          success: true,
          data: res,
        };
      }),
    );
  }
}
