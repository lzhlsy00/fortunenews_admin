import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { errorResponse, successResponse } from '@/lib/api/response';
import { serializeNews } from '@/lib/api/serializers';
import { applyCorsHeaders, createCorsPreflightResponse } from '@/lib/api/cors';
import { z } from 'zod';

type RouteContext = {
  params: {
    id: string;
  };
};

const idSchema = z.coerce.number().int().min(1, '新闻ID必须是正整数');

export const GET = async (request: Request, context: RouteContext) => {
  try {
    const id = idSchema.parse(context.params.id);

    const news = await prisma.news.findFirst({
      where: {
        id,
        status: 'PUBLISH',
      },
    });

    if (!news) {
      return errorResponse('新闻不存在或未发布', { status: 404 });
    }

    const { aiReason: _aiReason, status: _status, ...rest } = serializeNews(news);
    void _aiReason;
    void _status;

    return applyCorsHeaders(successResponse(rest), request);
  } catch (error) {
    return applyCorsHeaders(handleRouteError(error), request);
  }
};

export const OPTIONS = async (request: Request) => createCorsPreflightResponse(request);
