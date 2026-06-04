import { Request, Response } from "express";
import { ListNewsUseCase } from "../../application/use-cases/news/ListNewsUseCase";
import { newsRepository } from "../../infrastructure/repositories/newsRepository";

export class NewsController {
  private listNewsUseCase = new ListNewsUseCase(newsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const published = req.query.published === "true";
      const data = await this.listNewsUseCase.execute(req.query.published ? { published } : undefined);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await newsRepository.getNewsById(req.params.id);
      if (!data) return res.status(404).json({ error: "Artículo no encontrado" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { title, content, image_url, published } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "title y content son requeridos" });
      }
      const data = await newsRepository.createNews({
        title,
        content,
        image_url,
        published: published || false,
      });
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await newsRepository.deleteNews(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

export const newsController = new NewsController();
export default newsController;
