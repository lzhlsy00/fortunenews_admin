import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';
import { serializeNewsList } from '@/lib/api/serializers';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().min(1).max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  title: z.string().min(1).max(1000).optional(),
  aiWorth: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  sortBy: z.enum(['id', 'title', 'isoDate', 'category', 'status', 'aiWorth']).default('id'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

type AdminNewsQuery = z.infer<typeof querySchema>;

const buildFilters = (query: AdminNewsQuery): Prisma.NewsWhereInput => {
  const where: Prisma.NewsWhereInput = {};

  if (query.category) {
    where.category = {
      contains: query.category,
      mode: 'insensitive',
    };
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.title) {
    where.title = {
      contains: query.title,
      mode: 'insensitive',
    };
  }

  if (query.aiWorth !== undefined) {
    where.aiWorth = query.aiWorth;
  }

  return where;
};

const buildOrderBy = (query: AdminNewsQuery): Prisma.NewsOrderByWithRelationInput[] => {
  if (query.sortBy === 'isoDate') {
    return [
      { isoDate: query.sortOrder },
      { id: query.sortOrder },
    ];
  }

  return [
    { [query.sortBy]: query.sortOrder } as Prisma.NewsOrderByWithRelationInput,
  ];
};

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawEntries = Object.fromEntries(
      Array.from(searchParams.entries()).map(([key, value]) => [key, value || undefined])
    );

    const parsed = querySchema.safeParse(rawEntries);
    if (!parsed.success) {
      return handleRouteError(parsed.error);
    }

    const query = parsed.data;
    const skip = (query.page - 1) * query.limit;
    const where = buildFilters(query);

    const [total, news] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: buildOrderBy(query),
      }),
    ]);

    const totalPages = query.limit > 0 ? Math.ceil(total / query.limit) : 0;

    return successResponse({
      news: serializeNewsList(news),
      pagination: {
        current: query.page,
        total: totalPages,
        count: news.length,
        totalCount: total,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
};
