import { INewsRepository } from "../../domain/repositories/INewsRepository";
import { NewsArticle } from "../../domain/entities";
import prisma from "../db/prismaClient";

export class PrismaNewsRepository implements INewsRepository {
  async listNews(filter?: { published?: boolean }): Promise<NewsArticle[]> {
    const where: any = {};
    if (filter?.published) where.published = true;
    return prisma.news_articles.findMany({ where, orderBy: { created_at: "desc" } }) as any;
  }

  async getNewsById(id: string): Promise<NewsArticle | null> {
    return prisma.news_articles.findUnique({ where: { id } }) as any;
  }

  async createNews(data: any): Promise<NewsArticle> {
    return prisma.news_articles.create({ data }) as any;
  }

  async deleteNews(id: string): Promise<NewsArticle> {
    return prisma.news_articles.delete({ where: { id } }) as any;
  }
}

export const newsRepository = new PrismaNewsRepository();
export default newsRepository;
