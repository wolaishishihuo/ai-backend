# AI Backend Docker 部署文档

## 快速开始

### 首次部署

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 填写数据库、JWT、API Key 等配置

# 2. 创建数据库
mysql -e "CREATE DATABASE \`ai-web\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. 构建并启动
docker-compose up -d --build

# 4. 验证
curl http://localhost:3000/api/health
```

### 更新部署

| 场景           | 命令                                                                  |
| -------------- | --------------------------------------------------------------------- |
| 代码更新       | `git pull && docker-compose up -d --build`                            |
| 数据库结构变更 | `git pull && docker-compose up -d --build`（启动时自动同步）          |
| 新增环境变量   | 修改 `.env` 后 `docker-compose up -d --force-recreate`                |
| 依赖包更新     | `git pull && docker-compose build --no-cache && docker-compose up -d` |
| 回滚           | `git checkout <commit> && docker-compose up -d --build`               |

---

## 常用命令

```bash
# 查看日志
docker logs -f ai-backend

# 重启服务
docker-compose restart backend

# 停止服务
docker-compose down

# 进入容器调试
docker exec -it ai-backend sh
```

---

## 环境变量说明

```env
# 数据库（必填）
MYSQL_DATABASE_URL="mysql://用户名:密码@localhost:3306/ai-web"
DATABASE_USER="用户名"
DATABASE_PASSWORD="密码"
DATABASE_NAME="ai-web"

# JWT（必填）
JWT_SECRET=你的密钥
JWT_EXPIRATION=7d

# AI 模型（必填）
DEEPSEEK_API_KEY=你的key

# CORS（生产环境必填）
CORS_ORIGIN=http://你的域名

# Redis（可选，不填则禁用）
REDIS_HOST=
REDIS_PASSWORD=
```

---

## 问题排查

| 错误                        | 解决方案                                          |
| --------------------------- | ------------------------------------------------- |
| `Connection refused`        | 检查 MySQL 是否运行，确认 `.env` 中数据库配置正确 |
| `Cannot find module 'xxx'`  | `docker-compose build --no-cache` 重新构建        |
| `port is already allocated` | `lsof -i:3000` 查看占用，或修改端口映射           |

```bash
# 查看容器内环境变量
docker exec ai-backend env | grep DATABASE

# 测试数据库连接
docker exec -it ai-backend npx prisma db push --dry-run
```

## 数据库重置

### 方案一：使用 Prisma Reset（推荐）

**完全重置**：删除所有数据 + 重新运行迁移 + 运行 seed（会创建初始数据）

```bash
# 进入容器执行
docker exec -it ai-backend npx prisma migrate reset

# 或者直接执行（需要确认，输入 yes）
docker exec -it ai-backend sh -c "echo 'yes' | npx prisma migrate reset"
```

**注意**：这会删除所有表数据，然后重新创建表结构并运行 seed（会创建 admin 用户）

### 方案二：只清空数据（保留表结构）

**清空所有表数据**，但保留表结构：

```bash
# 进入容器
docker exec -it ai-backend sh

# 执行清空命令
npx prisma db execute --stdin <<EOF
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE usages;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;
EOF
```

### 方案三：直接连接数据库

```bash
# 连接 MySQL（根据你的配置调整）
mysql -u 用户名 -p 数据库名

# 执行 SQL
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE usages;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;
```

### 方案四：删除并重建数据库

```bash
# 1. 删除数据库
mysql -u 用户名 -p -e "DROP DATABASE IF EXISTS \`ai-web\`;"

# 2. 重新创建数据库
mysql -u 用户名 -p -e "CREATE DATABASE \`ai-web\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. 重新运行迁移（容器启动时会自动执行，或手动执行）
docker exec -it ai-backend npx prisma migrate deploy
docker exec -it ai-backend npx prisma db seed
```

---

## 详细配置参考

<details>
<summary>Dockerfile.prod 说明</summary>

- 采用多阶段构建，减小镜像体积
- 构建阶段：安装全部依赖 + 编译
- 生产阶段：只安装生产依赖 + 复制构建产物
- 启动时自动执行 `prisma db push` 同步数据库

</details>

<details>
<summary>docker-compose.yml 说明</summary>

- `host.docker.internal:host-gateway`：允许容器访问宿主机的 MySQL
- 服务名 `backend`（docker-compose 命令用）
- 容器名 `ai-backend`（docker 命令用）

</details>

<details>
<summary>踩坑记录</summary>

1. **bcrypt 模块找不到**：确保 bcrypt 在 dependencies 而非 devDependencies
2. **Redis master 名称错误**：不用 Redis 就注释掉 REDIS_HOST
3. **服务名 vs 容器名**：`docker-compose` 用 `backend`，`docker` 用 `ai-backend`

</details>
