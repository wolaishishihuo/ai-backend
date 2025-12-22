import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@src/common/decorators';
import { JwtUser } from '../auth/strategies/jwt.strategy';

@ApiTags('统计模块')
@Controller('statistics')
@UseGuards(AuthGuard('jwt'))
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取总览数据' })
  async getOverview(@User() user: JwtUser) {
    return this.statisticsService.getOverview(user.id);
  }

  @Get('usage/daily')
  @ApiOperation({ summary: '获取每日用量趋势' })
  @ApiQuery({ name: 'days', required: false, description: '查询天数，默认30' })
  async getDailyUsage(@User() user: JwtUser, @Query('days') days?: string) {
    return this.statisticsService.getDailyUsage(
      user.id,
      days ? parseInt(days) : 30
    );
  }

  @Get('usage/by-model')
  @ApiOperation({ summary: '按模型统计用量' })
  async getUsageByModel(@User() user: JwtUser) {
    return this.statisticsService.getUsageByModel(user.id);
  }

  @Get('conversation/:id')
  @ApiOperation({ summary: '获取单个会话统计' })
  async getConversationStats(@Param('id') id: string) {
    return this.statisticsService.getConversationStats(id);
  }

  @Get('top-conversations')
  @ApiOperation({ summary: '获取 Token 消耗最多的会话' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量，默认10' })
  async getTopConversations(
    @User() user: JwtUser,
    @Query('limit') limit?: string
  ) {
    return this.statisticsService.getTopConversations(
      user.id,
      limit ? parseInt(limit) : 10
    );
  }
}
