import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';
import { serializeNews } from '@/lib/api/serializers';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const uploadSchema = z.object({
  title: z.string().min(1, '新闻标题不能为空').max(1000, '新闻标题长度必须在1-1000字符之间'),
  isoDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: '新闻日期格式不正确，请使用ISO8601格式',
  }),
  link: z.string().url('新闻链接格式不正确，请提供有效的URL'),
  content: z.string().max(5000, '新闻内容长度不能超过5000字符').nullish(),
  aiWorth: z.boolean().nullish(),
  aiReason: z.string().max(2000, 'AI评估原因长度不能超过2000字符').nullish(),
  category: z.string().max(100, '新闻分类长度不能超过100字符').nullish(),
  status: z.enum(['DRAFT', 'PUBLISH']).nullish(),
});

type UploadInput = z.infer<typeof uploadSchema>;

const buildCreateData = (input: UploadInput): Prisma.NewsCreateInput => {
  const {
    title,
    isoDate,
    link,
    status,
    content,
    aiReason,
    aiWorth,
    category,
  } = input;

  const data: Prisma.NewsCreateInput = {
    title,
    isoDate: new Date(isoDate),
    link,
    status: status ?? 'DRAFT',
  };

  if (content !== undefined) data.content = content ?? null;
  if (aiReason !== undefined) data.aiReason = aiReason ?? null;
  if (aiWorth !== undefined) data.aiWorth = aiWorth ?? null;
  if (category !== undefined) data.category = category ?? null;

  return data;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = uploadSchema.parse(payload);

    const news = await prisma.news.create({
      data: buildCreateData(input),
    });

    return successResponse(serializeNews(news), { status: 201, message: '新闻上传成功' });
  } catch (error) {
    return handleRouteError(error);
  }
}
