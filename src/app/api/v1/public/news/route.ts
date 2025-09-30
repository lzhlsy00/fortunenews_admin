import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';
import { serializeNewsList } from '@/lib/api/serializers';
import { applyCorsHeaders, createCorsPreflightResponse } from '@/lib/api/cors';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().min(1).max(100).optional(),
  hot: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  latest: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

type PublicNewsQuery = z.infer<typeof querySchema>;

const buildWhere = (query: PublicNewsQuery): Prisma.NewsWhereInput => {
  const where: Prisma.NewsWhereInput = {
    status: 'PUBLISH',
  };

  if (query.category) {
    where.category = {
      contains: query.category,
      mode: 'insensitive',
    };
  }

  if (query.hot) {
    where.aiWorth = true;
  }

  return where;
};

export const GET = async (request: NextRequest) => {
  try {
    const params = Object.fromEntries(
      Array.from(request.nextUrl.searchParams.entries()).map(([key, value]) => [
        key,
        value || undefined,
      ])
    );

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return handleRouteError(parsed.error);
    }

    const query = parsed.data;
    const skip = (query.page - 1) * query.limit;
    const orderBy: Prisma.NewsOrderByWithRelationInput[] = query.latest
      ? [{ isoDate: 'desc' }, { id: 'desc' }]
      : [{ id: 'desc' }];

    const where = buildWhere(query);

    const [total, news] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
      }),
    ]);

    const serialized = serializeNewsList(news).map(({ aiReason: _aiReason, status: _status, ...rest }) => {
      void _aiReason;
      void _status;
      return { ...rest };
    });

    const totalPages = query.limit > 0 ? Math.ceil(total / query.limit) : 0;

    const response = successResponse({
      news: serialized,
      pagination: {
        current: query.page,
        total: totalPages,
        count: serialized.length,
        totalCount: total,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });

    return applyCorsHeaders(response, request);
  } catch (error) {
    return applyCorsHeaders(handleRouteError(error), request);
  }
};

export const OPTIONS = async (request: NextRequest) => createCorsPreflightResponse(request);
