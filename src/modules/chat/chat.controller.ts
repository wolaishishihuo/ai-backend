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
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  createUIMessageStream,
  pipeUIMessageStreamToResponse
} from 'ai';
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
    @Res() response: Response
  ) {
    const { modelType, messages } = generateConversationDto;

    const apiKey = this.configService.get('DEEPSEEK_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('DEEPSEEK_API_KEY is not set');
    }

    const deepseek = createDeepSeek({
      apiKey
    });

    // ✅ 使用 createUIMessageStream 创建流
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: deepseek(modelType),
          messages: await convertToModelMessages(messages),
          stopWhen: stepCountIs(5)
        });

        // ✅ 使用 toUIMessageStream 支持 sendReasoning
        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
            sendSources: true
          })
        );
      }
    });

    // ✅ 使用 pipeUIMessageStreamToResponse 将流输出到响应
    pipeUIMessageStreamToResponse({ stream, response });
  }
}
