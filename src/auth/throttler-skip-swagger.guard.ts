import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerSkipSwaggerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Default key is IP; keep default behavior
    return req.ip as string;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { path?: string; originalUrl?: string }>();
    const path = (req.originalUrl || req.path || '').toLowerCase();
    // Skip throttling for swagger docs and openapi json
    if (path.startsWith('/api/docs') || path.startsWith('/api-json')) {
      return true;
    }
    return super.canActivate(context);
  }
}
