import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [MessageModule],
  controllers: [ChatController],
  exports: [ChatController]
})
export class ChatModule {}
