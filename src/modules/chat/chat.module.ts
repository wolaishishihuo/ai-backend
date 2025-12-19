import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';

@Module({
  imports: [],
  controllers: [ChatController],
  exports: []
})
export class ChatModule {}
