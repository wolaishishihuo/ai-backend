import {
  Injectable,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new BadRequestException('用户名和密码不能为空');
    }

    const { user, code } = await this.authService.validateUser(
      username,
      password
    );

    switch (code) {
      case 1:
        return user;
      case 2:
        throw new UnauthorizedException('密码错误');
      case 3:
        throw new UnauthorizedException('用户不存在');
      default:
        throw new UnauthorizedException('登录失败');
    }
  }
}
