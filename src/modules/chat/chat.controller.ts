import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { GenerateConversationDto } from './dto/generate-conversation.dto';
import { convertToModelMessages, streamText } from 'ai';
import { SkipResponseInterceptor } from '@src/common/decorators';
import { ConfigService } from '@nestjs/config';
import { createDeepSeek } from '@ai-sdk/deepseek';

@ApiTags('AI 模块')
@Controller('chat')
export class ChatController {
  constructor(private readonly configService: ConfigService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成会话' })
  @ApiResponse({ status: 200, description: '生成会话成功' })
  @HttpCode(HttpStatus.OK)
  @SkipResponseInterceptor() // 跳过响应拦截器，支持流式传输
  async generateConversation(
    @Body() generateConversationDto: GenerateConversationDto,
    @Res() res: Response
  ) {
    const { modelType, messages } = generateConversationDto;

    const apiKey = this.configService.get('DEEPSEEK_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('DEEPSEEK_API_KEY is not set');
    }
    const deepseek = createDeepSeek({
      apiKey
    });

    const result = streamText({
      model: deepseek(modelType), // 直接用模型名
      messages: convertToModelMessages(messages)
    });
    // 使用 AI SDK 内置方法直接 pipe 流式响应到 Node.js Response
    result.pipeUIMessageStreamToResponse(res, {
      sendReasoning: true
    });
  }
}
