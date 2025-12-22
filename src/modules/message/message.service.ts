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

  /**
   * 删除会话中最后一条指定角色的消息
   */
  async deleteLastMessageByRole(conversationId: string, role: MessageRole) {
    const lastMessage = await this.prisma.message.findFirst({
      where: {
        conversationId,
        role
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (lastMessage) {
      await this.prisma.message.delete({
        where: { id: lastMessage.id }
      });
    }

    return lastMessage;
  }
}
