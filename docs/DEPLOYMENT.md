# AI Backend Docker 部署文档

本文档详细说明 `ai-backend` 后端服务的 Docker 部署流程。

## 目录

- [环境要求](#环境要求)
- [项目文件说明](#项目文件说明)
- [环境变量配置](#环境变量配置)
- [Dockerfile.prod 详解](#dockerfileprod-详解)
- [docker-compose.yml 详解](#docker-composeyml-详解)
- [部署步骤](#部署步骤)
- [常用命令](#常用命令)
- [问题排查](#问题排查)
- [部署踩坑记录](#部署踩坑记录)

---

## 环境要求

| 组件           | 版本要求   | 说明                          |
| -------------- | ---------- | ----------------------------- |
| 服务器         | Linux      | 本文档基于 OpenCloudOS        |
| Docker         | 20.x+      | 容器运行环境                  |
| Docker Compose | 2.x+       | 容器编排工具                  |
| MySQL          | 5.7+ / 8.x | 宝塔面板或独立安装            |
| Node.js        | 22.x       | Docker 镜像内置，无需单独安装 |

---

## 项目文件说明

```
ai-backend/
├── docker-compose.yml   # Docker Compose 编排文件
├── Dockerfile.prod      # 生产环境 Docker 构建文件
├── .env                 # 环境变量（不提交到 Git）
├── .env.example         # 环境变量示例
├── prisma/
│   └── schema.prisma    # 数据库模型定义
├── prisma.config.ts     # Prisma 配置文件
├── src/                 # 源代码目录
├── package.json         # 项目依赖配置
├── pnpm-lock.yaml       # 依赖锁定文件
└── docs/
    └── DEPLOYMENT.md    # 本文档
```

---

## 环境变量配置

在 `ai-backend` 目录创建 `.env` 文件：

```bash
cd ai-backend
cp .env.example .env
```

### 完整环境变量说明

```env
# ===========================================
# 数据库配置 (MySQL)
# ===========================================
MYSQL_DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
DATABASE_USER="用户名"
DATABASE_PASSWORD="密码"
DATABASE_NAME="ai-web"
DATABASE_HOST="localhost"
DATABASE_PORT=3306

# ===========================================
# Redis 配置 (可选，不配置则禁用 Redis)
# ===========================================
# 单机模式：填写 host 即可
# 哨兵模式：多个节点用逗号分隔，如 host1:26379,host2:26379
REDIS_HOST=
REDIS_PASSWORD=
REDIS_SENTINELS=          # 哨兵模式的 master 名称，如 mymaster
REDIS_DB=0

# ===========================================
# JWT 配置
# ===========================================
JWT_SECRET=你的jwt密钥
JWT_EXPIRATION=1h

# ===========================================
# 模型 Key 配置
# ===========================================
DEEPSEEK_API_KEY=你的deepseek_api_key

# ===========================================
# CORS 配置 (生产环境)
# ===========================================
# 多个域名用逗号分隔，开发环境不配置则允许所有来源
CORS_ORIGIN=http://你的服务器IP
```

---

## Dockerfile.prod 详解

采用**多阶段构建**优化镜像大小和构建效率。

### 完整文件内容

```dockerfile
# ============================================
# 构建阶段 - 安装所有依赖并构建应用
# ============================================
FROM node:22.13.0-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN MYSQL_DATABASE_URL="mysql://temp:temp@localhost:3306/temp" npx prisma generate

COPY . .
RUN pnpm run build

# ============================================
# 生产阶段 - 只包含运行时必需的文件
# ============================================
FROM node:22.13.0-slim

WORKDIR /app

# 安装系统依赖（bcrypt 编译需要 python3 make g++）
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl curl python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && \
    rm -rf /root/.npm /root/.pnpm-store

# 复制 Prisma 文件并生成 Client（确保平台兼容）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
RUN MYSQL_DATABASE_URL="mysql://temp:temp@localhost:3306/temp" npx prisma generate

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma db push && node dist/src/main.js"]
```

### 关键配置说明

| 配置项                   | 说明                                                |
| ------------------------ | --------------------------------------------------- |
| `FROM node:22.13.0-slim` | 使用精简版 Node.js 镜像减小体积                     |
| `--frozen-lockfile`      | 确保依赖版本与 lock 文件一致                        |
| `--ignore-scripts`       | 构建阶段跳过 postinstall 脚本（如 husky）           |
| `python3 make g++`       | bcrypt 原生模块编译所需工具                         |
| `--prod`                 | 生产阶段只安装 dependencies，不安装 devDependencies |
| `prisma db push`         | 启动时自动同步数据库结构                            |
| `HEALTHCHECK`            | Docker 健康检查，每 30 秒检测一次                   |

---

## docker-compose.yml 详解

### 完整文件内容

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: ai-backend
    restart: always
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      MYSQL_DATABASE_URL: mysql://${DATABASE_USER}:${DATABASE_PASSWORD}@host.docker.internal:3306/${DATABASE_NAME}
      DATABASE_HOST: host.docker.internal
      DATABASE_PORT: 3306
      DATABASE_USER: ${DATABASE_USER}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      # Redis 暂未使用，不配置则自动禁用
      # REDIS_HOST: host.docker.internal
      # REDIS_PORT: 6379
      # REDIS_DB: 0
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 7d
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      CORS_ORIGIN: ${CORS_ORIGIN}
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - ai-network

networks:
  ai-network:
    driver: bridge
```

### 关键配置说明

| 配置项                              | 说明                                    |
| ----------------------------------- | --------------------------------------- |
| `build.context: .`                  | 构建上下文为当前目录（ai-backend）      |
| `build.dockerfile`                  | 指定使用 Dockerfile.prod                |
| `container_name`                    | 容器名称，用于 `docker logs ai-backend` |
| `restart: always`                   | 容器异常退出时自动重启                  |
| `ports: "3000:3000"`                | 宿主机端口:容器端口映射                 |
| `host.docker.internal:host-gateway` | **关键！** 允许容器访问宿主机的 MySQL   |
| `${变量名}`                         | 从 `.env` 文件读取环境变量              |

### 服务名 vs 容器名

- **服务名**：`backend`（用于 docker-compose 命令）
- **容器名**：`ai-backend`（用于 docker 命令）

```bash
# 使用服务名
docker-compose build backend
docker-compose restart backend

# 使用容器名
docker logs ai-backend
docker exec -it ai-backend sh
```

---

## 部署步骤

### 1. 准备工作

```bash
# 进入 ai-backend 目录
cd ai-backend

# 确保 .env 文件已配置
cat .env
```

### 2. 创建数据库

在宝塔面板或 MySQL 中创建数据库：

```sql
CREATE DATABASE `ai-web` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 构建镜像

```bash
# 首次构建或代码更新后（不使用缓存）
docker-compose build --no-cache backend

# 日常构建（使用缓存加速）
docker-compose build backend
```

### 4. 启动服务

```bash
# 后台启动
docker-compose up -d

# 查看启动日志
docker logs -f ai-backend
```

### 5. 验证部署

```bash
# 健康检查
curl http://localhost:3000/api/health

# 预期返回
{"status":"ok","info":{"database":{"status":"up"}},"error":{},"details":{"database":{"status":"up"}}}
```

---

## 常用命令

### 容器管理

```bash
# 查看容器状态
docker ps

# 查看所有容器（包括已停止）
docker ps -a

# 查看容器日志
docker logs ai-backend

# 实时查看日志
docker logs -f ai-backend

# 查看最近 100 行日志
docker logs --tail 100 ai-backend
```

### 服务操作

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart backend

# 重新构建并启动
docker-compose up -d --build

# 强制重新构建（不使用缓存）
docker-compose build --no-cache backend && docker-compose up -d
```

### 进入容器调试

```bash
# 进入容器
docker exec -it ai-backend sh

# 在容器内查看文件
ls -la /app

# 在容器内测试数据库连接
npx prisma db push --dry-run
```

### 清理资源

```bash
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除所有未使用资源（谨慎使用）
docker system prune -a
```

---

## 问题排查

### 查看日志定位问题

```bash
# 查看完整启动日志
docker logs ai-backend

# 实时监控日志
docker logs -f ai-backend
```

### 常见错误及解决

| 错误信息                    | 原因           | 解决方案                                       |
| --------------------------- | -------------- | ---------------------------------------------- |
| `Cannot find module 'xxx'`  | 依赖未正确安装 | 检查 package.json 中依赖位置                   |
| `Connection refused`        | 数据库连接失败 | 检查 MySQL 是否运行，host.docker.internal 配置 |
| `EACCES permission denied`  | 权限问题       | 检查文件权限                                   |
| `port is already allocated` | 端口被占用     | `lsof -i:3000` 查看占用进程                    |

### 检查容器内环境

```bash
# 进入容器
docker exec -it ai-backend sh

# 查看环境变量
env | grep -E 'DATABASE|REDIS|JWT'

# 测试数据库连接
node -e "console.log(process.env.MYSQL_DATABASE_URL)"
```

---

## 部署踩坑记录

### 问题 1：Cannot find module 'bcrypt'

**错误日志**：

```
Error: Cannot find module 'bcrypt'
```

**原因**：`bcrypt` 是原生模块，被错误地放在 `devDependencies` 中，生产环境执行 `pnpm install --prod` 时未安装。

**解决方案**：

1. 将 `bcrypt` 从 `devDependencies` 移到 `dependencies`
2. 在 Dockerfile 生产阶段添加编译工具：
   ```dockerfile
   RUN apt-get install -y python3 make g++
   ```
3. 移除 `--ignore-scripts` 参数允许原生模块编译

---

### 问题 2：Requires the name of master (Redis 错误)

**错误日志**：

```
[error] Requires the name of master.
```

**原因**：Redis 服务代码默认使用哨兵模式（Sentinel），需要配置 `REDIS_SENTINELS` 指定 master 名称。

**解决方案**：

1. 如果使用单机 Redis：修改 `redis.service.ts` 支持单机模式
2. 如果暂不使用 Redis：在 `docker-compose.yml` 中注释掉 `REDIS_HOST` 环境变量

---

### 问题 3：no such service: ai-backend

**错误日志**：

```
no such service: ai-backend
```

**原因**：混淆了服务名和容器名。

**解决方案**：

- docker-compose 命令使用**服务名**：`backend`
- docker 命令使用**容器名**：`ai-backend`

```bash
# 正确用法
docker-compose build backend    # 服务名
docker logs ai-backend          # 容器名
```

---

## 更新部署

当代码更新后，执行以下步骤：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build --no-cache backend

# 3. 重启服务
docker-compose up -d

# 4. 查看日志确认启动成功
docker logs -f ai-backend
```
