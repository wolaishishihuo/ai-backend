import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { RedisService } from '@src/datasources/redis/redis.service';
import { SendEmailDto } from './dto/sendEmail.dto';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly redisService: RedisService
  ) {}

  @Post('send')
  @ApiOperation({ summary: '发送验证码' })
  @ApiResponse({ status: 200, description: '发送验证码成功' })
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: SendEmailDto) {
    // 检查发送频率（60秒内不能重复发送）
    const rateLimitKey = `captcha:ratelimit:${body.email}`;
    const isLimited = await this.redisService.get(rateLimitKey);
    if (isLimited) {
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }

    // 生成 6 位纯数字验证码
    const captcha = Math.floor(100000 + Math.random() * 900000).toString();

    // 设置验证码，有效期 5 分钟
    await this.redisService.set(`captcha:${body.email}`, captcha, 60 * 5);
    // 设置频率限制，60 秒内不能重复发送
    await this.redisService.set(rateLimitKey, '1', 60);

    return await this.emailService.sendEmail(
      body.email,
      '验证码',
      `您的验证码是：${captcha}，有效期5分钟`
    );
  }
}
