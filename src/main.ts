import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import * as bodyParser from 'body-parser';
import LoggerConfig from './common/configs/logger.config';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AllExceptionsFilter } from './common/filters/all.exception';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// 开启swagger api
function useSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('The Swagger API Description')
    .setVersion('1.0')
    .addTag('Swagger')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  // 使用 Winston 日志
  const logger = winston.createLogger(LoggerConfig);
  // 创建实例
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(logger)
  });

  // cors：跨域资源共享
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true
  });

  // 增加请求体大小限制（默认 100KB 太小，对话历史可能很长）
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // 服务统一前缀（适用于统一网关服务）
  app.setGlobalPrefix('api');

  // 开启全局验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤掉 DTO 里没定义的字段
      forbidNonWhitelisted: false, // 有多余字段直接报错
      transform: true // 自动转换类型
    })
  );

  // 全局日志中间件
  app.use(new LoggerMiddleware().use);

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // 全局响应拦截器（使用 Reflector 支持装饰器元数据读取）
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  // 使用swagger生成API文档
  useSwagger(app);

  // 服务监听
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // 读取配置文件
  const configService = app.get(ConfigService);

  // 服务地址
  const serviceUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  logger.info(`Application is running at: ${serviceUrl}`);
  logger.info(`Swagger API is running at: ${serviceUrl}/docs`);
  logger.info(`This ENV is: ${configService.get('NODE_ENV')}`);
}

// 启动服务
bootstrap();
