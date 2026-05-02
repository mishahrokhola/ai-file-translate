import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((key: keyof UserDto | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Express.Request>();
  const user = request.user;

  return key ? user?.[key] : user;
});
