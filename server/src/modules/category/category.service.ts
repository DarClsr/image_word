/**
 * 分类服务
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  QueryCategoryInput,
  SortCategoryInput,
} from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建分类
   */
  async create(dto: CreateCategoryInput) {
    // 检查编码是否已存在
    const existing = await this.prisma.category.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('分类编码已存在');
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  /**
   * 查询分类列表
   */
  async findAll(query: QueryCategoryInput) {
    const where: Record<string, unknown> = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }
    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { code: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    return this.prisma.category.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      include: {
        children: {
          where: { status: 1 },
          orderBy: { sort: 'asc' },
        },
      },
    });
  }

  /**
   * 获取风格列表（小程序端）
   */
  async getStyles() {
    return this.prisma.category.findMany({
      where: {
        type: 'style',
        status: 1,
        parentId: null,
      },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        icon: true,
        cover: true,
        description: true,
      },
    });
  }

  /**
   * 获取模型列表（小程序端）
   */
  async getModels() {
    return this.prisma.category.findMany({
      where: {
        type: 'model',
        status: 1,
      },
      orderBy: { sort: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        icon: true,
        description: true,
        config: true,
      },
    });
  }

  /**
   * 获取分类详情
   */
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  /**
   * 更新分类
   */
  async update(id: number, dto: UpdateCategoryInput) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除分类
   */
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        worksAsStyle: { take: 1 },
        worksAsModel: { take: 1 },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    if (category.children.length > 0) {
      throw new ConflictException('请先删除子分类');
    }

    // 检查是否有关联作品
    if (category.worksAsStyle.length > 0 || category.worksAsModel.length > 0) {
      throw new ConflictException('该分类下有关联作品，无法删除');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * 批量更新排序
   */
  async updateSort(dto: SortCategoryInput) {
    const updates = dto.items.map((item) =>
      this.prisma.category.update({
        where: { id: item.id },
        data: { sort: item.sort },
      }),
    );

    await this.prisma.$transaction(updates);

    return { success: true, count: dto.items.length };
  }

  /**
   * 切换状态
   */
  async toggleStatus(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return this.prisma.category.update({
      where: { id },
      data: { status: category.status === 1 ? 0 : 1 },
    });
  }
}
