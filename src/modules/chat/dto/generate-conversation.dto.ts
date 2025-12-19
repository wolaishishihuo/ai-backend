import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { UIMessage } from 'ai';

// 改成真正的 enum
export enum ModelType {
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_REASONER = 'deepseek-reasoner'
}

export class GenerateConversationDto {
  @ApiProperty({
    description: '模型类型',
    enum: ModelType
  })
  @IsEnum(ModelType, {
    message: 'modelType 必须是 deepseek-chat 或 deepseek-reasoner'
  })
  modelType: ModelType;

  @ApiProperty({ description: '消息' })
  @IsArray()
  @IsNotEmpty({ message: 'messages 不能为空' })
  messages: UIMessage[];
}
