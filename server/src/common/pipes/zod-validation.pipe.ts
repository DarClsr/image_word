/**
 * Zod 验证管道
 */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ErrorCodes } from '../filters/http-exception.filter';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: '参数验证失败',
          errors,
        });
      }
      throw error;
    }
  }
}

/**
 * 创建 Zod 验证管道的工厂函数
 */
export function zodValidation(schema: ZodSchema) {
  return new ZodValidationPipe(schema);
}
