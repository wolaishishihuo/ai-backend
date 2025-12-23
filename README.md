# AI Web 后端

基于 NestJS 的 AI 聊天应用后端服务

## 技术栈

- NestJS 11 + TypeScript 5
- Prisma 7 (ORM)
- MySQL / MariaDB
- Redis（可选，哨兵模式）
- JWT 身份认证
- Swagger API 文档
- Winston 日志系统
- Docker 容器化部署

**版本管理：** Volta (Node.js 22.x)

## 功能特性

- ✅ JWT 登录鉴权
- ✅ Swagger API 在线文档
- ✅ 数据库 ORM（Prisma）
- ✅ Redis 缓存支持（哨兵模式）
- ✅ HTTP 请求封装（@nestjs/axios）
- ✅ 日志系统（Winston，按日分割）
- ✅ 代码规范（ESLint + Prettier + Husky + Commitlint）
- ✅ 统一响应格式（拦截器、过滤器、守卫）
- ✅ 静态资源服务（/static）
- ✅ 多环境配置支持
- ✅ 服务健康检查
- ✅ Docker 容器化部署

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 配置数据库连接等
```

### 3. 初始化数据库

```bash
pnpm run db:generate    # 生成 Prisma Client
pnpm run db:migrate     # 运行数据库迁移
pnpm run db:seed        # 填充种子数据（可选）
```

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### 5. 访问 API 文档

启动后访问 http://localhost:3000/docs 查看 Swagger 文档

## 常用命令

```bash
# 开发
pnpm run start:dev      # 开发模式
pnpm run start:debug    # 调试模式

# 数据库
pnpm run db:generate    # 生成 Prisma Client
pnpm run db:migrate     # 运行迁移
pnpm run db:seed        # 填充种子数据
pnpm run db:studio      # 打开 Prisma Studio
pnpm run db:reset       # 重置数据库

# 代码质量
pnpm run lint           # ESLint 检查
pnpm run format         # Prettier 格式化
pnpm run test           # 运行测试
pnpm run test:cov       # 测试覆盖率

# 构建
pnpm run build          # 构建生产版本
```

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── modules/                # 功能模块
│   ├── auth/               # 认证模块
│   ├── user/               # 用户模块
│   └── health/             # 健康检查
├── datasources/            # 数据源
│   ├── prisma/             # Prisma 服务
│   └── redis/              # Redis 服务
├── common/                 # 公共模块
│   ├── configs/            # 配置
│   ├── filters/            # 异常过滤器
│   ├── guards/             # 守卫
│   ├── http/               # HTTP 模块
│   ├── interceptors/       # 拦截器
│   └── middlewares/        # 中间件
└── utils/                  # 工具函数

prisma/
├── schema.prisma           # 数据库模型
├── seed.ts                 # 种子数据
└── migrations/             # 迁移文件
```

## 环境变量

参考 `.env.example` 文件：

| 变量               | 说明                       | 必填 |
| ------------------ | -------------------------- | ---- |
| MYSQL_DATABASE_URL | 数据库连接字符串           | 是   |
| JWT_SECRET         | JWT 签名密钥               | 否   |
| JWT_EXPIRATION     | JWT 过期时间（默认 1h）    | 否   |
| REDIS_HOST         | Redis 哨兵节点             | 否   |
| REDIS_PASSWORD     | Redis 密码                 | 否   |
| REDIS_SENTINELS    | 哨兵 master 名称           | 否   |
| PORT               | 服务端口（默认 3000）      | 否   |
| CORS_ORIGIN        | 允许的跨域来源（逗号分隔） | 否   |

## License

UNLICENSED
