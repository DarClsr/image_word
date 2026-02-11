/**
 * 模板服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { QueryTemplateInput } from './schemas/template.schema';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取模板列表（小程序端）
   */
  async findAll(query: QueryTemplateInput) {
    const { page, pageSize, keyword, styleId, modelId } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { status: 1 };
    if (styleId) where.styleId = styleId;
    if (modelId) where.modelId = modelId;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { prompt: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ sort: 'asc' }, { id: 'desc' }],
        select: {
          id: true,
          name: true,
          prompt: true,
          imageUrl: true,
          styleId: true,
          modelId: true,
          useCount: true,
          likeCount: true,
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    const categoryIds = Array.from(new Set(list.flatMap((item) => [item.styleId, item.modelId])));
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, code: true },
    });
    const categoryMap = new Map(categories.map((item) => [item.id, item]));

    return {
      list: list.map((item) => {
        const style = categoryMap.get(item.styleId);
        const model = categoryMap.get(item.modelId);
        return {
          id: item.id,
          name: item.name,
          prompt: item.prompt,
          imageUrl: item.imageUrl,
          likes: item.likeCount,
          shares: item.useCount,
          styleId: item.styleId,
          style: style?.name || '',
          styleCode: style?.code || '',
          modelId: item.modelId,
          model: model?.name || '',
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取模板详情（小程序端）
   */
  async findOne(id: number) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        prompt: true,
        imageUrl: true,
        styleId: true,
        modelId: true,
        useCount: true,
        likeCount: true,
      },
    });

    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    const categories = await this.prisma.category.findMany({
      where: { id: { in: [template.styleId, template.modelId] } },
      select: { id: true, name: true, code: true },
    });
    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const style = categoryMap.get(template.styleId);
    const model = categoryMap.get(template.modelId);

    return {
      id: template.id,
      name: template.name,
      prompt: template.prompt,
      imageUrl: template.imageUrl,
      likes: template.likeCount,
      shares: template.useCount,
      styleId: template.styleId,
      style: style?.name || '',
      styleCode: style?.code || '',
      modelId: template.modelId,
      model: model?.name || '',
    };
  }
}
