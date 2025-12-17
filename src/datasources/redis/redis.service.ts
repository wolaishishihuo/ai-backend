import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST');

    if (!host) {
      this.logger.warn('REDIS_HOST is not defined, Redis is disabled');
      return;
    }

    const password = this.configService.get<string>('REDIS_PASSWORD');
    const sentinelsName = this.configService.get<string>('REDIS_SENTINELS');
    const db = this.configService.get<number>('REDIS_DB', 0);

    // 解析哨兵节点
    const sentinels = host.split(',').map((item) => {
      const [h, port] = item.split(':');
      return { host: h, port: parseInt(port) || 26379 };
    });

    // 哨兵模式连接
    this.client = new Redis({
      sentinels,
      name: sentinelsName,
      password,
      db
    });
  }

  async onModuleInit() {
    if (!this.client) return;

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async onModuleDestroy() {
    if (!this.client) return;

    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  // 检查 Redis 是否可用
  isEnabled(): boolean {
    return this.client !== null;
  }

  // 获取原始 Redis 客户端
  getClient(): Redis | null {
    return this.client;
  }

  // 常用方法封装（Redis 未启用时返回 null）
  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    if (!this.client) return null;
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.client) return 0;
    return this.client.expire(key, seconds);
  }
}
