import { Injectable } from '@nestjs/common';
import { MessageRole } from '@prisma/client';
import { UIMessagePart, UIDataTypes, UITools } from 'ai';
import { PrismaService } from '@src/datasources/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  createMessage(
    conversationId: string,
    parts: Array<UIMessagePart<UIDataTypes, UITools>>,
    role: MessageRole,
    metadata?: Record<string, unknown>
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        parts: JSON.stringify(parts),
        role,
        metadata: JSON.stringify(metadata)
      }
    });
  }

  async findMessagesByConversationId(conversationId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId
      },
      select: {
        parts: true,
        role: true,
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      parts: JSON.parse(message.parts as string)
    }));
  }
}
