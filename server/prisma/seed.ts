/**
 * 数据库种子数据
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 生成密码哈希
 */
async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString('hex');
  const saltedPassword = password + salt;
  const hash = await bcrypt.hash(saltedPassword, 12);
  return { hash, salt };
}

async function main() {
  console.log('开始初始化种子数据...');

  // ==================== 创建管理员 ====================
  const adminPassword = await hashPassword('Admin@123');
  
  const superAdmin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword.hash,
      salt: adminPassword.salt,
      realName: '超级管理员',
      role: 'super_admin',
      permissions: ['*'],
      status: 1,
    },
  });
  console.log(`创建超级管理员: ${superAdmin.username}`);

  // ==================== 创建风格分类 ====================
  const styles = [
    { name: '国风', code: 'guofeng', icon: '🏯', description: '中国传统风格，水墨山水、工笔花鸟' },
    { name: '写实', code: 'realistic', icon: '📷', description: '真实光影效果，逼真细节' },
    { name: '动漫', code: 'anime', icon: '🎨', description: '日系动漫风格，清新角色' },
    { name: '插画', code: 'illustration', icon: '✏️', description: '扁平插画风格，清晰线条' },
    { name: '赛博', code: 'cyberpunk', icon: '🌃', description: '赛博朋克风格，霓虹科幻' },
    { name: '极简', code: 'minimal', icon: '⬜', description: '极简设计风格，简约现代' },
  ];

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    await prisma.category.upsert({
      where: { code: style.code },
      update: {},
      create: {
        name: style.name,
        code: style.code,
        type: 'style',
        icon: style.icon,
        description: style.description,
        sort: i,
        status: 1,
      },
    });
    console.log(`创建风格分类: ${style.name}`);
  }

  // ==================== 创建模型分类 ====================
  const models = [
    {
      name: 'SDXL',
      code: 'sdxl',
      icon: '⚡',
      description: '稳定高效，性价比之选',
      config: { price: 1, speed: 'fast', quality: 'high' },
    },
    {
      name: 'Flux',
      code: 'flux',
      icon: '🎭',
      description: '风格细腻，艺术感强',
      config: { price: 2, speed: 'medium', quality: 'very_high' },
    },
    {
      name: 'DALL·E',
      code: 'dalle',
      icon: '🤖',
      description: '理解力强，通用表现',
      config: { price: 3, speed: 'medium', quality: 'high' },
    },
  ];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    await prisma.category.upsert({
      where: { code: model.code },
      update: {},
      create: {
        name: model.name,
        code: model.code,
        type: 'model',
        icon: model.icon,
        description: model.description,
        config: model.config,
        sort: i,
        status: 1,
      },
    });
    console.log(`创建模型分类: ${model.name}`);
  }

  // ==================== 创建系统配置 ====================
  const configs = [
    { key: 'default_quota', value: '5', description: '新用户默认额度' },
    { key: 'max_image_size', value: '10485760', description: '最大图片大小(字节)' },
    { key: 'allowed_image_types', value: 'image/jpeg,image/png,image/webp', description: '允许的图片类型' },
    { key: 'auto_audit', value: 'true', description: '是否自动审核通过' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
    console.log(`创建系统配置: ${config.key}`);
  }

  console.log('种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
