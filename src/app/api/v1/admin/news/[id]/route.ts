import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { errorResponse, successResponse } from '@/lib/api/response';
import { serializeNews } from '@/lib/api/serializers';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

type RouteContext = {
  params: {
    id: string;
  };
};

const idSchema = z.coerce.number().int().min(1, '新闻ID必须是正整数');

const updateSchema = z
  .object({
    title: z.string().min(1).max(1000).optional(),
    isoDate: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: '新闻日期格式不正确，请使用ISO8601格式',
      })
      .optional(),
    link: z.string().url('新闻链接格式不正确，请提供有效的URL').optional(),
    content: z.string().max(5000, '新闻内容长度不能超过5000字符').nullish(),
    aiWorth: z.boolean().nullish(),
    aiReason: z.string().max(2000, 'AI评估原因长度不能超过2000字符').nullish(),
    category: z.string().max(100, '新闻分类长度不能超过100字符').nullish(),
    status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: '至少需要提供一个字段进行更新',
  });

type UpdateInput = z.infer<typeof updateSchema>;

const buildUpdateData = (input: UpdateInput): Prisma.NewsUpdateInput => {
  const data: Prisma.NewsUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.isoDate !== undefined) data.isoDate = new Date(input.isoDate);
  if (input.link !== undefined) data.link = input.link;
  if (input.content !== undefined) data.content = input.content ?? null;
  if (input.aiWorth !== undefined) data.aiWorth = input.aiWorth ?? null;
  if (input.aiReason !== undefined) data.aiReason = input.aiReason ?? null;
  if (input.category !== undefined) data.category = input.category ?? null;
  if (input.status !== undefined) data.status = input.status;

  return data;
};

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const id = idSchema.parse(context.params.id);

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return errorResponse('新闻不存在', { status: 404 });
    }

    return successResponse(serializeNews(news));
  } catch (error) {
    return handleRouteError(error);
  }
};

export const PUT = async (request: Request, context: RouteContext) => {
  try {
    const id = idSchema.parse(context.params.id);
    const payload = await request.json();
    const input = updateSchema.parse(payload);

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('新闻不存在', { status: 404 });
    }

    const updated = await prisma.news.update({
      where: { id },
      data: buildUpdateData(input),
    });

    return successResponse(serializeNews(updated), { message: '新闻更新成功' });
  } catch (error) {
    return handleRouteError(error);
  }
};

export const DELETE = async (_request: Request, context: RouteContext) => {
  try {
    const id = idSchema.parse(context.params.id);

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('新闻不存在', { status: 404 });
    }

    await prisma.news.delete({ where: { id } });

    return successResponse({ id }, { message: '新闻删除成功' });
  } catch (error) {
    return handleRouteError(error);
  }
};
