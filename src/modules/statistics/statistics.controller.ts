import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('统计模块')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取总览数据' })
  async getOverview(@Req() req: any) {
    const userId = req.user?.id;
    return this.statisticsService.getOverview(userId);
  }

  @Get('usage/daily')
  @ApiOperation({ summary: '获取每日用量趋势' })
  @ApiQuery({ name: 'days', required: false, description: '查询天数，默认30' })
  async getDailyUsage(@Req() req: any, @Query('days') days?: string) {
    const userId = req.user?.id;
    return this.statisticsService.getDailyUsage(
      userId,
      days ? parseInt(days) : 30
    );
  }

  @Get('usage/by-model')
  @ApiOperation({ summary: '按模型统计用量' })
  async getUsageByModel(@Req() req: any) {
    const userId = req.user?.id;
    return this.statisticsService.getUsageByModel(userId);
  }

  @Get('conversation/:id')
  @ApiOperation({ summary: '获取单个会话统计' })
  async getConversationStats(@Param('id') id: string) {
    return this.statisticsService.getConversationStats(id);
  }

  @Get('top-conversations')
  @ApiOperation({ summary: '获取 Token 消耗最多的会话' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认10' })
  async getTopConversations(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id;
    return this.statisticsService.getTopConversations(
      userId,
      limit ? parseInt(limit) : 10
    );
  }
}
