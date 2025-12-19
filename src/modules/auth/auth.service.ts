import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // validate user by email
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return { code: 3, user: null };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return { code: 1, user };
    }
    return { code: 2, user: null };
  }

  // jwt certificate - 使用 email 生成 token
  async certificate(loginDto: any) {
    const { code, user } = await this.validateUser(
      loginDto.email,
      loginDto.password
    );

    if (code === 3) {
      throw new UnauthorizedException('用户不存在');
    }
    if (code === 2) {
      throw new UnauthorizedException('密码错误');
    }

    const payload = {
      email: user.email,
      sub: user.id
    };
    try {
      const token = this.jwtService.sign(payload);
      return { token };
    } catch (error) {
      throw new NotAcceptableException(error.message || 'Certificate error.');
    }
  }
}
