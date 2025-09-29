import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { errorResponse } from './response';

export const handleRouteError = (error: unknown) => {
  if (error instanceof ZodError) {
    return errorResponse('数据验证失败', {
      status: 400,
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return errorResponse('数据已存在，违反唯一约束', { status: 400 });
      case 'P2025':
        return errorResponse('记录未找到', { status: 404 });
      case 'P2003':
        return errorResponse('外键约束失败', { status: 400 });
      case 'P2014':
        return errorResponse('数据关系冲突', { status: 400 });
      default:
        return errorResponse('数据库操作失败', { status: 500 });
    }
  }

  console.error('Unhandled route error:', error);
  const message = error instanceof Error ? error.message : '服务器内部错误';
  return errorResponse(message, { status: 500 });
};
