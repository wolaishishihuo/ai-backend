import { PickType } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';

/**
 * 创建/注册用户 DTO
 * 从 BaseUserDto 中选取需要的字段
 */
export class CreateUserDto extends PickType(BaseUserDto, [
  'username',
  'password',
  'email'
] as const) {}
