import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';
import { applyCorsHeaders, createCorsPreflightResponse } from '@/lib/api/cors';

export const GET = async (request: Request) => {
  try {
    const categories = await prisma.news.groupBy({
      by: ['category'],
      _count: { category: true },
      where: {
        status: 'PUBLISH',
        category: {
          not: null,
        },
      },
    });

    const data = categories.map((item) => ({
      name: item.category ?? '未分类',
      count: item._count.category,
    }));

    return applyCorsHeaders(successResponse(data), request);
  } catch (error) {
    return applyCorsHeaders(handleRouteError(error), request);
  }
};

export const OPTIONS = async (request: Request) => createCorsPreflightResponse(request);
