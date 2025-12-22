import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ description: '会话标题' })
  @IsString()
  @IsNotEmpty({ message: '会话标题不能为空' })
  title: string;
}
