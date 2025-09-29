import { News } from '@prisma/client';

type SerializedNews = Omit<News, 'isoDate'> & {
  isoDate: string;
};

export const serializeNews = (news: News): SerializedNews => ({
  ...news,
  isoDate: news.isoDate.toISOString(),
});

export const serializeNewsList = (items: News[]): SerializedNews[] => items.map(serializeNews);
