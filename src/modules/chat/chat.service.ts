import { Injectable } from '@nestjs/common';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

@Injectable()
export class ChatService {
  generateConversation(messages: UIMessage[]) {
    // sk-aee5030d61bb49a986fe4b0e9d7c91be
    const result = streamText({
      model: 'perplexity/sonar',
      messages: convertToModelMessages(messages)
    });
    return result.toUIMessageStreamResponse();
  }
}
