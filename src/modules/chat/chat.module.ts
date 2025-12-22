import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { MessageModule } from '../message/message.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [MessageModule, StatisticsModule],
  controllers: [ChatController]
})
export class ChatModule {}
