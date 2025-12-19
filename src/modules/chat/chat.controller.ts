import { Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('AI 模块')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
}
