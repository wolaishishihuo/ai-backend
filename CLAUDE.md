# CLAUDE.md

本文件为 Claude Code (claude.ai/claude-code) 提供项目指引。

## 项目概述

基于 NestJS 的模板服务器项目，使用 Prisma ORM，适用于快速构建 REST API。

**技术栈：**

- NestJS 11.x + TypeScript 5.x
- Prisma 7.x（ORM，MySQL/MariaDB）
- Redis（可选，哨兵模式）
- Passport + JWT（身份认证）
- Winston（日志系统，按日分割）
- Swagger（API 文档）
- Node.js 22.x（Volta 管理）

## 常用命令

```bash
# 开发
pnpm install          # 安装依赖
pnpm run start:dev    # 启动开发服务器（热重载）
pnpm run start:debug  # 启动调试模式

# 数据库（Prisma）
pnpm run db:generate  # 生成 Prisma Client
pnpm run db:migrate   # 运行数据库迁移
pnpm run db:seed      # 填充种子数据
pnpm run db:studio    # 打开 Prisma Studio
pnpm run db:push      # 推送 schema 变更（不生成迁移）
pnpm run db:reset     # 重置数据库

# 构建与生产
pnpm run build        # 构建生产版本
pnpm run start:prod   # 运行生产版本

# 代码质量
pnpm run lint         # 运行 ESLint 检查并自动修复
pnpm run format       # 使用 Prettier 格式化代码
pnpm run test         # 运行测试
pnpm run test:cov     # 运行测试并生成覆盖率报告
```

## 项目结构

```
src/
├── main.ts                 # 应用入口，Swagger、全局管道/过滤器配置
├── app.module.ts           # 根模块
├── modules/                # 功能模块
│   ├── auth/               # 认证模块（JWT、Passport 策略）
│   ├── user/               # 用户模块（CRUD）
│   └── health/             # 健康检查
├── datasources/            # 数据层
│   ├── prisma/             # Prisma 服务
│   └── redis/              # Redis 服务（可选）
├── common/                 # 公共模块
│   ├── configs/            # 配置（日志等）
│   ├── constants.ts        # 常量定义（JWT 密钥等）
│   ├── filters/            # 异常过滤器
│   ├── guards/             # 认证守卫
│   ├── http/               # HTTP 模块（@nestjs/axios）
│   ├── interceptors/       # 响应拦截器
│   └── middlewares/        # 中间件
└── utils/                  # 工具函数

prisma/
├── schema.prisma           # 数据库模型定义
├── seed.ts                 # 种子数据
└── migrations/             # 数据库迁移文件
```

## 架构模式

### 模块结构

每个功能模块遵循 NestJS 规范：

- `*.module.ts` - 模块定义
- `*.controller.ts` - HTTP 接口（带 Swagger 装饰器）
- `*.service.ts` - 业务逻辑，注入 PrismaService
- `dto/*.dto.ts` - 数据传输对象（class-validator 验证）

### 认证流程

1. `LocalAuthGuard` 通过 `LocalStrategy` 验证用户名密码
2. `AuthService.login()` 生成 JWT Token（1 小时有效期）
3. 受保护的接口使用 `JwtAuthGuard` 配合 `JwtStrategy` 验证

### 响应格式

所有响应由 `ResponseInterceptor` 统一包装：

```json
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

### 异常处理

全局 `AllExceptionsFilter` 捕获所有异常并格式化错误响应。

### HTTP 请求

使用 `@nestjs/axios` 封装，在任意 Service 中注入 `HttpService`：

```ts
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SomeService {
  constructor(private readonly httpService: HttpService) {}

  async fetchData() {
    const { data } = await firstValueFrom(this.httpService.get('https://api.example.com/data'));
    return data;
  }
}
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

| 变量               | 必填 | 说明                               |
| ------------------ | ---- | ---------------------------------- |
| MYSQL_DATABASE_URL | 是   | Prisma 数据库连接字符串            |
| JWT_SECRET         | 否   | JWT 签名密钥（生产环境务必修改）   |
| JWT_EXPIRATION     | 否   | JWT 过期时间（默认 1h）            |
| REDIS_HOST         | 否   | Redis 哨兵节点（逗号分隔）         |
| REDIS_PASSWORD     | 否   | Redis 密码                         |
| REDIS_SENTINELS    | 否   | 哨兵 master 名称                   |
| REDIS_DB           | 否   | Redis 数据库编号                   |
| PORT               | 否   | 服务端口（默认 3000）              |
| CORS_ORIGIN        | 否   | 允许的跨域来源（逗号分隔，生产用） |
| HTTP_TIMEOUT       | 否   | HTTP 请求超时（毫秒，默认 5000）   |

## 关键文件

- `src/main.ts` - 应用启动、Swagger 配置、全局管道/过滤器
- `src/app.module.ts` - 根模块、配置加载
- `src/common/constants.ts` - JWT 密钥配置
- `prisma/schema.prisma` - 数据库模型
- `prisma.config.ts` - Prisma CLI 配置

## 代码规范

- ESLint + Prettier 通过 Husky pre-commit 钩子强制执行
- Commitlint 强制使用 Angular 提交信息规范
- ls-lint 文件命名规范检查
- 使用 `pnpm` 作为包管理器

## API 文档

启动服务后访问 `http://localhost:3000/docs` 查看 Swagger UI。

API 统一前缀：`/api`
