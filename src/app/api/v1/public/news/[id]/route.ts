import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { errorResponse, successResponse } from '@/lib/api/response';
import { serializeNews } from '@/lib/api/serializers';
import { applyCorsHeaders, createCorsPreflightResponse } from '@/lib/api/cors';
import { NextRequest } from 'next/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const idSchema = z.coerce.number().int().min(1, '新闻ID必须是正整数');

const parseId = async (context: RouteContext) => {
  const { id } = await context.params;
  return idSchema.parse(id);
};

export const GET = async (request: NextRequest, context: RouteContext) => {
  try {
    const id = await parseId(context);

    const news = await prisma.news.findFirst({
      where: {
        id,
        status: 'PUBLISH',
      },
    });

    if (!news) {
      return errorResponse('新闻不存在或未发布', { status: 404 });
    }

    const { aiReason: _aiReason, ...rest } = serializeNews(news);
    void _aiReason;

    return applyCorsHeaders(successResponse(rest), request);
  } catch (error) {
    return applyCorsHeaders(handleRouteError(error), request);
  }
};

export const OPTIONS = async (request: NextRequest) => createCorsPreflightResponse(request);
