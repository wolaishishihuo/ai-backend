import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, LoginDto, UpdateUserDto, UserResponseDto } from './dto';
import { PaginationDto } from '@src/common/dto/pagination.dto';

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 403, description: '登录成功' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: LoginDto) {
    return this.authService.certificate(user);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 200, description: '用户注册成功' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  @ApiOperation({ summary: '查询所有用户（分页）' })
  @ApiResponse({
    status: 200,
    description: '返回用户列表和分页信息'
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':email')
  @ApiOperation({ summary: '根据用户邮箱查询用户' })
  @ApiResponse({
    status: 200,
    description: '成功查询用户'
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('email') email: string): Promise<UserResponseDto[]> {
    return this.userService.findBy({ where: { email } });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({
    status: 200,
    description: '更新成功'
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({
    status: 200,
    description: '删除用户'
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  remove(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.remove(id);
  }
}
