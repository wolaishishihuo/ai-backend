import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseGuards
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
  pipeUIMessageStreamToResponse,
  TextUIPart,
  ReasoningUIPart
} from 'ai';
import { SkipResponseInterceptor, User } from '@src/common/decorators';
import { ConfigService } from '@nestjs/config';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { MessageService } from '../message/message.service';
import { UsageService } from '../statistics/usage.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@ApiTags('AI 模块')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    private readonly configService: ConfigService,
    private readonly messageService: MessageService,
    private readonly usageService: UsageService
  ) {}

  @Post('generate')
  @ApiOperation({ summary: '生成会话' })
  @ApiResponse({ status: 200, description: '生成会话成功' })
  @HttpCode(HttpStatus.OK)
  @SkipResponseInterceptor() // 跳过响应拦截器，支持流式传输
  async generateConversation(
    @Body() generateConversationDto: GenerateConversationDto,
    @User() user: JwtUser,
    @Res() response: Response
  ) {
    const { modelType, messages, conversationId, regenerate } =
      generateConversationDto;
    const userId = user.id;

    const apiKey = this.configService.get('DEEPSEEK_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('DEEPSEEK_API_KEY is not set');
    }

    const deepseek = createDeepSeek({
      apiKey
    });

    // 如果是重新生成，先删除上一条 assistant 消息
    if (regenerate) {
      await this.messageService.deleteLastMessageByRole(
        conversationId,
        'assistant'
      );
    }

    const conversationMessages =
      await this.messageService.findMessagesByConversationId(conversationId);

    // 获取用户发送的最新消息
    const userMessage = messages[messages.length - 1];

    // 非重新生成时才存储用户消息
    if (!regenerate) {
      await this.messageService.createMessage(
        conversationId,
        userMessage.parts,
        'user'
      );
    }

    // ✅ 使用 createUIMessageStream 创建流
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: deepseek(modelType),
          messages: convertToModelMessages([
            ...conversationMessages,
            ...messages
          ]),
          stopWhen: stepCountIs(5),
          // 流结束时存储 assistant 消息
          onFinish: async ({ text, reasoning, response, usage }) => {
            const parts: Array<TextUIPart | ReasoningUIPart> = [];

            // 添加 reasoning 部分（如果有）
            if (reasoning && reasoning.length > 0) {
              const reasoningText = reasoning
                .map((r) => r.text)
                .filter(Boolean)
                .join('');
              if (reasoningText) {
                parts.push({ type: 'reasoning', text: reasoningText });
              }
            }

            // 添加 text 部分
            if (text) {
              parts.push({ type: 'text', text });
            }

            if (parts.length > 0) {
              const message = await this.messageService.createMessage(
                conversationId,
                parts,
                'assistant',
                {
                  model: modelType,
                  modelId: response.modelId
                }
              );

              // 记录用量
              if (userId) {
                await this.usageService.createUsage({
                  userId,
                  conversationId,
                  messageId: message.id,
                  model: modelType,
                  inputTokens: usage.inputTokens || 0,
                  outputTokens: usage.outputTokens || 0,
                  totalTokens: usage.totalTokens,
                  cachedInputTokens: usage?.cachedInputTokens || 0,
                  reasoningTokens: usage?.reasoningTokens || 0
                });
              }
            }
          }
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
