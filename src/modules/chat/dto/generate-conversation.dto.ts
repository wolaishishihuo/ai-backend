import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { UIMessage } from 'ai';

// 改成真正的 enum
export enum ModelType {
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_REASONER = 'deepseek-reasoner'
}

export class GenerateConversationDto {
  @ApiProperty({
    description: '会话ID',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: '会话ID不能为空' })
  conversationId: string;

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

  @ApiProperty({
    description:
      '是否为重新生成（重新生成时不会重复存储用户消息，并会删除上一条 assistant 消息）',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  regenerate?: boolean;
}
