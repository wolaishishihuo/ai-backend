import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '@src/datasources/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import {
  PaginationDto,
  PaginatedResponseDto
} from '@src/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: data.email
      }
    });

    if (user) {
      throw new BadRequestException('用户已存在');
    }

    try {
      const hashPassword = await bcrypt.hash(data.password, 10);

      const created = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashPassword,
          username: data.username
        }
      });
      return new UserResponseDto(created);
    } catch (error) {
      throw new InternalServerErrorException(`创建用户失败: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationDto
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count()
    ]);

    const data = users.map((user) => new UserResponseDto(user));
    return new PaginatedResponseDto(data, total, page, pageSize);
  }

  async findBy(params): Promise<UserResponseDto[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const users = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    });
    return users.map((user) => new UserResponseDto(user));
  }

  async remove(id: string): Promise<UserResponseDto> {
    const deleted = await this.prisma.user.delete({
      where: { id }
    });
    return new UserResponseDto(deleted);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const updateData: UpdateUserDto = { ...data };

    // 如果更新密码，需要加密
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData
    });
    return new UserResponseDto(updated);
  }
}
