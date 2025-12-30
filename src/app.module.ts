import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './datasources/prisma/prisma.module';
import { RedisModule } from './datasources/redis/redis.module';
import { HttpModule } from './common/http/http.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { ChatModule } from './modules/chat/chat.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV || 'production'}`, '.env'],
      isGlobal: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static'
    }),
    HttpModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    UserModule,
    ConversationModule,
    ChatModule,
    StatisticsModule,
    EmailModule
  ]
})
export class AppModule {}
