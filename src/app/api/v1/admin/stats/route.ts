import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';

export const GET = async () => {
  try {
    const [
      totalCount,
      draftCount,
      publishedCount,
      aiWorthTrueCount,
      aiWorthFalseCount,
      categoryStats,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({ where: { status: 'DRAFT' } }),
      prisma.news.count({ where: { status: 'PUBLISH' } }),
      prisma.news.count({ where: { aiWorth: true } }),
      prisma.news.count({ where: { aiWorth: false } }),
      prisma.news.groupBy({
        by: ['category'],
        _count: { category: true },
        where: {
          category: {
            not: null,
          },
        },
      }),
    ]);

    const data = {
      total: totalCount,
      status: {
        draft: draftCount,
        published: publishedCount,
      },
      aiWorth: {
        true: aiWorthTrueCount,
        false: aiWorthFalseCount,
        null: totalCount - aiWorthTrueCount - aiWorthFalseCount,
      },
      categories: categoryStats.map((item) => ({
        name: item.category ?? '未分类',
        count: item._count.category,
      })),
    };

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
};
