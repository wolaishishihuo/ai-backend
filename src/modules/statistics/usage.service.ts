import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/datasources/prisma/prisma.service';
import { Prisma } from '@prisma/client';

// DeepSeek 价格配置（元/百万 token）
const PRICING = {
  'deepseek-chat': {
    input: 1,
    output: 2,
    cachedInput: 0.1
  },
  'deepseek-reasoner': {
    input: 4,
    output: 16,
    cachedInput: 0.4
  }
} as const;

export interface CreateUsageDto {
  userId: string;
  conversationId: string;
  messageId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens?: number;
  reasoningTokens?: number;
}

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  /**
   * 计算估算费用（元）
   */
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
    cachedInputTokens: number = 0
  ): number {
    const pricing = PRICING[model] || PRICING['deepseek-chat'];
    const actualInputTokens = inputTokens - cachedInputTokens;

    const inputCost = (actualInputTokens / 1_000_000) * pricing.input;
    const cachedCost = (cachedInputTokens / 1_000_000) * pricing.cachedInput;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + cachedCost + outputCost;
  }

  /**
   * 创建用量记录
   */
  async createUsage(data: CreateUsageDto) {
    const estimatedCost = this.calculateCost(
      data.model,
      data.inputTokens,
      data.outputTokens,
      data.cachedInputTokens
    );

    return this.prisma.usage.create({
      data: {
        userId: data.userId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        cachedInputTokens: data.cachedInputTokens || 0,
        reasoningTokens: data.reasoningTokens || 0,
        estimatedCost: new Prisma.Decimal(estimatedCost.toFixed(6))
      }
    });
  }
}
