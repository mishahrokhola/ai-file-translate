import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Express.Request>();
    request.user = { id: 1, name: 'admin' };

    return true;
  }
}
