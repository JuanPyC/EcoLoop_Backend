import { NewsArticle } from "../entities";

export interface INewsRepository {
  listNews(filter?: { published?: boolean }): Promise<NewsArticle[]>;
  getNewsById(id: string): Promise<NewsArticle | null>;
  createNews(data: any): Promise<NewsArticle>;
  deleteNews(id: string): Promise<NewsArticle>;
}
