import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  // validate user
  async validateUser(username: string, password: string): Promise<any> {
    const users = await this.userService.findBy({ where: { username } });
    const user = users[0];

    if (!user) {
      return { code: 3, user: null };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return { code: 1, user };
    }
    return { code: 2, user: null };
  }

  // jwt certificate
  async certificate(user: any) {
    const payload = {
      username: user.username,
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
