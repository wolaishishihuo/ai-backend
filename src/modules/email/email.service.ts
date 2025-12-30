import { Injectable, NotAcceptableException } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      // 是否使用 SSL/TLS
      secure: false,
      // 认证信息
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS')
      }
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: {
          name: this.configService.get('EMAIL_FROM_NAME'),
          address: this.configService.get('EMAIL_USER')
        },
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      throw new NotAcceptableException(error.message || '发送邮件失败');
    }
  }
}
