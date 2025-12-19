import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '@src/modules/auth/strategies/jwt.strategy';

export const User = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUser;

    return data ? user?.[data] : user;
  }
);
