import prisma from '@/lib/prisma';
import { handleRouteError } from '@/lib/api/error';
import { successResponse } from '@/lib/api/response';

export const GET = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (error) {
    return handleRouteError(error);
  }
};
