import { PickType } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';

/**
 * 用户登录 DTO
 * 从 BaseUserDto 中选取登录所需字段
 */
export class LoginDto extends PickType(BaseUserDto, [
  'username',
  'password'
] as const) {}
