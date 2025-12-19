import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { UIMessage } from 'ai';

export type ModelType = 'deepseek-chat' | 'deepseek-reasoner';

export class GenerateConversationDto {
  @ApiProperty({
    description: '模型类型: deepseek-chat, deepseek-reasoner'
  })
  @IsNotEmpty({ message: 'modelType 不能为空' })
  modelType: ModelType;

  @ApiProperty({ description: '消息' })
  @IsArray()
  @IsNotEmpty({ message: 'messages 不能为空' })
  messages: UIMessage[];
}
