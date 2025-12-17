import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

/**
 * 用户基础 DTO - 定义所有字段和验证规则
 * 其他 DTO 通过 PickType/PartialType 等派生
 */
export class BaseUserDto {
  @ApiProperty({ description: '用户名，唯一' })
  @IsString()
  @IsNotEmpty({ message: 'username 不能为空' })
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty({ message: 'password 不能为空' })
  @MinLength(4, { message: '密码长度不能少于4位' })
  password: string;

  // 未来扩展字段示例：
  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  // @ApiProperty({ description: '头像' })
  // @IsUrl({}, { message: '头像必须是有效的 URL' })
  // @IsOptional()
  // avatar?: string;
}
