#!/bin/bash
# backup-db.sh - 数据库备份脚本

set -e

# 配置
BACKUP_DIR="/opt/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
RETENTION_DAYS=7

# 从环境变量获取数据库连接信息
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-app}
DB_USER=${DB_USER:-postgres}

echo "===== 创建备份目录 ====="
mkdir -p $BACKUP_DIR

echo "===== 开始备份数据库 ====="
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -F c \
  -f $BACKUP_FILE

echo "===== 压缩备份文件 ====="
gzip $BACKUP_FILE

echo "===== 清理过期备份 ====="
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "===== 备份完成 ====="
ls -lh $BACKUP_DIR
