import { PartialType } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';

/**
 * 更新用户 DTO
 * 从 BaseUserDto 派生，所有字段可选
 */
export class UpdateUserDto extends PartialType(BaseUserDto) {}
