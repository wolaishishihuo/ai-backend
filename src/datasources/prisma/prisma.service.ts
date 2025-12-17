import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('MYSQL_DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('MYSQL_DATABASE_URL is not defined');
    }

    const url = new URL(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      connectionLimit: 5
    });

    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log('Prisma connecting to database...');
    await this.$connect();
    this.logger.log('Prisma connected to database');
  }

  async onModuleDestroy() {
    this.logger.log('Prisma disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}
