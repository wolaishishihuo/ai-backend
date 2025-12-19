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
    // 使用 email 作为用户名字段
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    if (!email || !password) {
      throw new BadRequestException('邮箱和密码不能为空');
    }

    const { user, code } = await this.authService.validateUser(email, password);

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
