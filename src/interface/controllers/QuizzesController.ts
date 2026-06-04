import { Request, Response } from "express";
import { ListQuizzesUseCase } from "../../application/use-cases/quizzes/ListQuizzesUseCase";
import { GetQuizByIdUseCase } from "../../application/use-cases/quizzes/GetQuizByIdUseCase";
import { CompleteQuizUseCase } from "../../application/use-cases/quizzes/CompleteQuizUseCase";
import { ListQuizCompletionsUseCase } from "../../application/use-cases/quizzes/ListQuizCompletionsUseCase";
import { quizzesRepository } from "../../infrastructure/repositories/quizzesRepository";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";
import { ValidationError, NotFoundError } from "../../domain/errors";

const handleError = (res: Response, err: any) => {
  if (err instanceof ValidationError || err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError || err?.name === "NotFoundError" || err?.message?.toLowerCase().includes("not found")) {
    return res.status(404).json({ error: err.message || "Cuestionario no encontrado" });
  }
  return res.status(500).json({ error: err.message || "Error interno del servidor" });
};

export class QuizzesController {
  private listQuizzesUseCase = new ListQuizzesUseCase(quizzesRepository);
  private getQuizByIdUseCase = new GetQuizByIdUseCase(quizzesRepository);
  private completeQuizUseCase = new CompleteQuizUseCase(quizzesRepository, profilesRepository);
  private listQuizCompletionsUseCase = new ListQuizCompletionsUseCase(quizzesRepository);

  list = async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.active === "true" ? true : undefined;
      const data = await this.listQuizzesUseCase.execute(activeOnly);
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await this.getQuizByIdUseCase.execute(id);
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const result = await this.completeQuizUseCase.execute({
        user_id: userId,
        quiz_id: id,
        answers,
      });

      return res.json(result);
    } catch (err: any) {
      return handleError(res, err);
    }
  };

  listCompletions = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const data = await this.listQuizCompletionsUseCase.execute(userId);
      return res.json(data);
    } catch (err: any) {
      return handleError(res, err);
    }
  };
}

export const quizzesController = new QuizzesController();
export default quizzesController;
