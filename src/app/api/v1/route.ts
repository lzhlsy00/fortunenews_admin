import { NextResponse } from 'next/server';

export const GET = () => {
  return NextResponse.json({
    message: '欢迎使用 Fortune News API',
    version: '2.0.0',
    framework: 'Next.js App Router + Prisma',
    documentation: '/api/v1/docs',
    description: '简化版API，专为第三方新闻上传设计',
    endpoints: {
      health: '/api/v1/health',
      upload: '/api/v1/upload',
      docs: '/api/v1/docs',
    },
  });
};
