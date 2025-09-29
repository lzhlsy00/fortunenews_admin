import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';
import { serializeNewsList } from '@/lib/api/serializers';

const TAKE_LIMIT = 10;

export const GET = async () => {
  try {
    const pending = await prisma.news.findMany({
      where: { aiWorth: null },
      take: TAKE_LIMIT,
      orderBy: { id: 'asc' },
    });

    if (pending.length === 0) {
      return successResponse(
        {
          news: [],
          count: 0,
          hasMore: false,
          totalPending: 0,
        },
        { message: '暂无需要AI评估的新闻' }
      );
    }

    const totalPending = await prisma.news.count({ where: { aiWorth: null } });

    return successResponse(
      {
        news: serializeNewsList(pending),
        count: pending.length,
        totalPending,
        hasMore: totalPending > TAKE_LIMIT,
      },
      { message: `找到 ${pending.length} 条待评估新闻` }
    );
  } catch (error) {
    return handleRouteError(error);
  }
};
