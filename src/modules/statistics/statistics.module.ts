import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { UsageService } from './usage.service';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, UsageService],
  exports: [UsageService]
})
export class StatisticsModule {}
