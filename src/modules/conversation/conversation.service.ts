import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PrismaService } from '@src/datasources/prisma/prisma.service';
import {
  PaginationDto,
  PaginatedResponseDto
} from '@src/common/dto/pagination.dto';
@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(createConversationDto: CreateConversationDto, userId: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        title: createConversationDto.title
      }
    });
    return conversation.id;
  }

  async findAll(userId: string, pagination: PaginationDto) {
    const { page = 1, pageSize = 10 } = pagination;
    const skip = (page - 1) * pageSize;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          userId
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.conversation.count({
        where: {
          userId
        }
      })
    ]);

    return new PaginatedResponseDto(conversations, total, page, pageSize);
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          select: {
            id: true,
            parts: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    // 将 parts JSON 字符串转换为对象
    if (conversation?.messages) {
      conversation.messages = conversation.messages.map((msg) => ({
        ...msg,
        parts: typeof msg.parts === 'string' ? JSON.parse(msg.parts) : msg.parts
      }));
    }

    return conversation;
  }

  remove(id: string) {
    return this.prisma.conversation.delete({
      where: {
        id
      }
    });
  }
}
