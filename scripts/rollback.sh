#!/bin/bash
# rollback.sh - 回滚脚本

set -e

APP_DIR="/opt/app"
COMPOSE_FILE="docker-compose.prod.yml"
REGISTRY="ghcr.io/your-repo"

cd $APP_DIR

echo "===== 停止当前服务 ====="
docker-compose -f $COMPOSE_FILE stop server worker

echo "===== 切换到备份镜像 ====="
docker tag $REGISTRY/server:backup $REGISTRY/server:latest

echo "===== 启动服务 ====="
docker-compose -f $COMPOSE_FILE up -d server worker

echo "===== 等待服务启动 ====="
sleep 10

echo "===== 健康检查 ====="
curl -f http://localhost:3000/health || exit 1

echo "===== 回滚完成 ====="
docker-compose -f $COMPOSE_FILE ps
