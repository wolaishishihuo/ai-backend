import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { GenerateConversationDto } from './dto/generate-conversation.dto';
import { deepseek } from '@src/common/providers/deepseek.provider';
import { convertToModelMessages, streamText } from 'ai';

@ApiTags('AI 模块')
@Controller('chat')
export class ChatController {
  constructor() {}

  @Post('generate')
  @ApiOperation({ summary: '生成会话' })
  @ApiResponse({ status: 200, description: '生成会话成功' })
  @HttpCode(HttpStatus.OK)
  generateConversation(
    @Body() generateConversationDto: GenerateConversationDto
  ) {
    const { modelType, messages } = generateConversationDto;

    const model = deepseek(modelType);

    const result = streamText({
      model,
      messages: convertToModelMessages(messages)
    });

    return result.toUIMessageStreamResponse();
  }
}
