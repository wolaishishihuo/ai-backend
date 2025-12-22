import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/datasources/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取总览数据
   */
  async getOverview(userId: string) {
    const [conversationCount, messageCount, usageStats, todayUsage] =
      await Promise.all([
        // 总会话数
        this.prisma.conversation.count({ where: { userId } }),
        // 总消息数
        this.prisma.message.count({
          where: { conversation: { userId } }
        }),
        // 用量汇总
        this.prisma.usage.aggregate({
          where: { userId },
          _sum: {
            inputTokens: true,
            outputTokens: true,
            totalTokens: true,
            estimatedCost: true
          },
          _count: true
        }),
        // 今日用量
        this.prisma.usage.aggregate({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          _sum: {
            totalTokens: true,
            estimatedCost: true
          }
        })
      ]);

    return {
      totalConversations: conversationCount,
      totalMessages: messageCount,
      totalRequests: usageStats._count,
      totalInputTokens: usageStats._sum.inputTokens || 0,
      totalOutputTokens: usageStats._sum.outputTokens || 0,
      totalTokens: usageStats._sum.totalTokens || 0,
      estimatedCost: Number(usageStats._sum.estimatedCost || 0),
      todayTokens: todayUsage._sum.totalTokens || 0,
      todayCost: Number(todayUsage._sum.estimatedCost || 0)
    };
  }

  /**
   * 按天统计用量趋势
   */
  async getDailyUsage(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const usages = await this.prisma.usage.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      select: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        estimatedCost: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // 按天聚合
    const dailyMap = new Map<
      string,
      {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        cost: number;
        count: number;
      }
    >();

    usages.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        count: 0
      };
      dailyMap.set(date, {
        inputTokens: existing.inputTokens + u.inputTokens,
        outputTokens: existing.outputTokens + u.outputTokens,
        totalTokens: existing.totalTokens + u.totalTokens,
        cost: existing.cost + Number(u.estimatedCost),
        count: existing.count + 1
      });
    });

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  /**
   * 按模型统计
   */
  async getUsageByModel(userId: string) {
    const result = await this.prisma.usage.groupBy({
      by: ['model'],
      where: { userId },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        estimatedCost: true
      },
      _count: true
    });

    return result.map((r) => ({
      model: r.model,
      count: r._count,
      inputTokens: r._sum.inputTokens || 0,
      outputTokens: r._sum.outputTokens || 0,
      totalTokens: r._sum.totalTokens || 0,
      cost: Number(r._sum.estimatedCost || 0)
    }));
  }

  /**
   * 单个会话统计
   */
  async getConversationStats(conversationId: string) {
    const [messageCount, usageStats] = await Promise.all([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.usage.aggregate({
        where: { conversationId },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          estimatedCost: true
        },
        _count: true
      })
    ]);

    return {
      messageCount,
      requestCount: usageStats._count,
      inputTokens: usageStats._sum.inputTokens || 0,
      outputTokens: usageStats._sum.outputTokens || 0,
      totalTokens: usageStats._sum.totalTokens || 0,
      estimatedCost: Number(usageStats._sum.estimatedCost || 0)
    };
  }

  /**
   * Token 消耗最多的会话
   */
  async getTopConversations(userId: string, limit: number = 10) {
    const result = await this.prisma.usage.groupBy({
      by: ['conversationId'],
      where: { userId },
      _sum: {
        totalTokens: true,
        estimatedCost: true
      },
      _count: true,
      orderBy: {
        _sum: { totalTokens: 'desc' }
      },
      take: limit
    });

    // 获取会话标题
    const conversationIds = result.map((r) => r.conversationId);
    const conversations = await this.prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      select: { id: true, title: true }
    });
    const titleMap = new Map(conversations.map((c) => [c.id, c.title]));

    return result.map((r) => ({
      conversationId: r.conversationId,
      title: titleMap.get(r.conversationId) || 'Unknown',
      requestCount: r._count,
      totalTokens: r._sum.totalTokens || 0,
      cost: Number(r._sum.estimatedCost || 0)
    }));
  }
}
