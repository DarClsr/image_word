#!/bin/bash
# deploy.sh - 部署脚本

set -e

APP_DIR="/opt/app"
COMPOSE_FILE="docker-compose.prod.yml"

cd $APP_DIR

echo "===== 拉取最新镜像 ====="
docker-compose -f $COMPOSE_FILE pull

echo "===== 停止旧服务 ====="
docker-compose -f $COMPOSE_FILE down

echo "===== 运行数据库迁移 ====="
docker-compose -f $COMPOSE_FILE run --rm server npx prisma migrate deploy

echo "===== 启动新服务 ====="
docker-compose -f $COMPOSE_FILE up -d

echo "===== 等待服务启动 ====="
sleep 15

echo "===== 健康检查 ====="
curl -f http://localhost:3000/health || exit 1

echo "===== 清理旧镜像 ====="
docker image prune -f

echo "===== 部署完成 ====="
docker-compose -f $COMPOSE_FILE ps
