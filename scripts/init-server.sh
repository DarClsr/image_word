#!/bin/bash
# init-server.sh - 服务器初始化脚本

set -e

echo "===== 更新系统 ====="
apt-get update && apt-get upgrade -y

echo "===== 安装 Docker ====="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "===== 安装 Docker Compose ====="
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "===== 配置防火墙 ====="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "===== 创建应用目录 ====="
mkdir -p /opt/app
cd /opt/app

echo "===== 配置 Docker 登录 ====="
# 需要手动配置 GitHub Container Registry 登录
# echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

echo "===== 初始化完成 ====="
echo "请手动执行以下步骤:"
echo "1. 配置 Docker 登录: echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
echo "2. 复制 docker-compose.prod.yml 到 /opt/app/"
echo "3. 创建 .env 文件配置环境变量"
