# server/Dockerfile

# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 移除开发依赖
RUN npm prune --production

# ==================== 运行阶段 ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 安全：创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/main.js"]
