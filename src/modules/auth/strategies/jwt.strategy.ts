import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '@src/common/constants';

export interface JwtUser {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 不忽略过期，过期就 401
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: any): Promise<JwtUser> {
    return {
      id: payload.sub,
      email: payload.email
    };
  }
}
