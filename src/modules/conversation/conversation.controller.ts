import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtUser } from '@src/modules/auth/strategies/jwt.strategy';
import { User } from '@src/common/decorators';
import { PaginationDto } from '@src/common/dto/pagination.dto';
import { ParseRequiredPipe } from '@src/common/pipes';

@ApiTags('会话模块')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @ApiOperation({ summary: '创建会话' })
  @ApiResponse({ status: 200, description: '创建会话成功' })
  @HttpCode(HttpStatus.OK)
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  @ApiOperation({ summary: '获取会话列表' })
  @ApiResponse({ status: 200, description: '获取会话列表成功' })
  @HttpCode(HttpStatus.OK)
  findAll(@User() user: JwtUser, @Query() pagination: PaginationDto) {
    return this.conversationService.findAll(user.id, pagination);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('detail/:id')
  @ApiOperation({ summary: '获取会话详情' })
  @ApiResponse({ status: 200, description: '获取会话详情成功' })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseRequiredPipe('会话ID')) id: string) {
    return this.conversationService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  @ApiOperation({ summary: '删除会话' })
  @ApiResponse({ status: 200, description: '删除会话成功' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', new ParseRequiredPipe('会话ID')) id: string) {
    return this.conversationService.remove(id);
  }
}
