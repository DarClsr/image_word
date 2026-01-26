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
    { 
      name: '国风', 
      code: 'chinese', 
      description: '中国传统风格，水墨山水、工笔花鸟',
      config: {
        icon: '🏯',
        gradient: 'linear-gradient(135deg, #DC2626, #F87171)',
        promptSuffix: 'Chinese traditional style, ink painting, elegant, masterpiece',
      },
    },
    { 
      name: '写实', 
      code: 'realistic', 
      description: '真实光影效果，逼真细节',
      config: {
        icon: '📷',
        gradient: 'linear-gradient(135deg, #059669, #34D399)',
        promptSuffix: 'photorealistic, 8k, highly detailed, sharp focus',
      },
    },
    { 
      name: '动漫', 
      code: 'anime', 
      description: '日系动漫风格，清新角色',
      config: {
        icon: '🎨',
        gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
        promptSuffix: 'anime style, vibrant colors, detailed illustration, beautiful',
      },
    },
    { 
      name: '插画', 
      code: 'illustration', 
      description: '扁平插画风格，清晰线条',
      config: {
        icon: '✏️',
        gradient: 'linear-gradient(135deg, #DB2777, #F472B6)',
        promptSuffix: 'illustration, flat design, clean lines, modern',
      },
    },
    { 
      name: '赛博', 
      code: 'cyberpunk', 
      description: '赛博朋克风格，霓虹科幻',
      config: {
        icon: '🌃',
        gradient: 'linear-gradient(135deg, #0891B2, #22D3EE)',
        promptSuffix: 'cyberpunk, neon lights, futuristic, sci-fi, high tech',
      },
    },
    { 
      name: '极简', 
      code: 'minimal', 
      description: '极简设计风格，简约现代',
      config: {
        icon: '⬜',
        gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
        promptSuffix: 'minimalist, simple, clean, modern design, white space',
      },
    },
  ];

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    await prisma.category.upsert({
      where: { code: style.code },
      update: { config: style.config },
      create: {
        name: style.name,
        code: style.code,
        type: 'style',
        description: style.description,
        config: style.config,
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
      description: '稳定高效，性价比之选',
      config: { 
        icon: '⚡',
        price: 1, 
        speed: 4,     // 1-5，越高越快
        quality: 4,   // 1-5，越高质量越好
        badge: '推荐',
      },
    },
    {
      name: 'Flux',
      code: 'flux',
      description: '风格细腻，艺术感强',
      config: { 
        icon: '🎭',
        price: 2, 
        speed: 3, 
        quality: 5,
        badge: '高质量',
      },
    },
    {
      name: 'DALL·E 3',
      code: 'dalle3',
      description: '理解力强，通用表现',
      config: { 
        icon: '🤖',
        price: 3, 
        speed: 3, 
        quality: 4,
        badge: '',
      },
    },
    {
      name: 'Midjourney',
      code: 'midjourney',
      description: '艺术质感，创意出色',
      config: { 
        icon: '🎨',
        price: 4, 
        speed: 2, 
        quality: 5,
        badge: '艺术',
      },
    },
  ];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    await prisma.category.upsert({
      where: { code: model.code },
      update: { config: model.config },
      create: {
        name: model.name,
        code: model.code,
        type: 'model',
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
    // 生成配置 - 图片比例选项
    { 
      key: 'generation_ratios', 
      value: JSON.stringify([
        { id: 1, label: '1:1 方形', value: '1:1', width: 1024, height: 1024, sort: 1 },
        { id: 2, label: '3:4 竖版', value: '3:4', width: 768, height: 1024, sort: 2 },
        { id: 3, label: '4:3 横版', value: '4:3', width: 1024, height: 768, sort: 3 },
        { id: 4, label: '9:16 手机屏', value: '9:16', width: 576, height: 1024, sort: 4 },
        { id: 5, label: '16:9 宽屏', value: '16:9', width: 1024, height: 576, sort: 5 },
      ]),
      description: '图片比例选项配置',
    },
    // 生成配置 - 生成数量选项
    { 
      key: 'generation_counts', 
      value: JSON.stringify([
        { id: 1, label: '1 张', value: 1, multiplier: 1, sort: 1 },
        { id: 2, label: '2 张', value: 2, multiplier: 2, sort: 2 },
        { id: 3, label: '4 张', value: 4, multiplier: 4, sort: 3 },
        { id: 4, label: '6 张', value: 6, multiplier: 6, sort: 4 },
        { id: 5, label: '8 张', value: 8, multiplier: 8, sort: 5 },
      ]),
      description: '生成数量选项配置',
    },
    // 生成配置 - 默认值
    { 
      key: 'generation_defaults', 
      value: JSON.stringify({
        styleId: 1,
        modelId: 1,
        ratioIndex: 0,
        countIndex: 2,
      }),
      description: '生成默认配置',
    },
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
