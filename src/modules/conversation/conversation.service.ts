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

  create(createConversationDto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        userId: createConversationDto.userId,
        title: createConversationDto.title
      }
    });
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

  findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: {
        id
      }
    });
  }

  remove(id: string) {
    return this.prisma.conversation.delete({
      where: {
        id
      }
    });
  }
}
