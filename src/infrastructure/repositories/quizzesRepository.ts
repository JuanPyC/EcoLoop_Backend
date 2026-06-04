import { IQuizzesRepository } from "../../domain/repositories/IQuizzesRepository";
import { Quiz, QuizCompletion } from "../../domain/entities";
import prisma from "../db/prismaClient";
import { NotFoundError, ValidationError } from "../../domain/errors";

export class PrismaQuizzesRepository implements IQuizzesRepository {
  async listQuizzes(activeOnly?: boolean): Promise<Quiz[]> {
    const where: any = {};
    if (activeOnly) {
      where.is_active = true;
    }
    return prisma.quizzes.findMany({
      where,
      include: {
        quiz_questions: {
          orderBy: {
            order_index: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    }) as any;
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    return prisma.quizzes.findUnique({
      where: { id },
      include: {
        quiz_questions: {
          orderBy: {
            order_index: "asc",
          },
        },
      },
    }) as any;
  }

  async createQuizCompletion(data: {
    user_id: string;
    quiz_id: string;
    score: number;
    points_earned: number;
  }): Promise<QuizCompletion> {
    try {
      return await prisma.quiz_completions.create({
        data: {
          user_id: data.user_id,
          quiz_id: data.quiz_id,
          score: data.score,
          points_earned: data.points_earned,
        },
        include: {
          quiz: true,
        },
      }) as any;
    } catch (error: any) {
      if (error && error.code === "P2002") {
        throw new ValidationError("El usuario ya ha completado este cuestionario.");
      }
      if (error && error.code === "P2003") {
        throw new NotFoundError("Usuario o cuestionario no encontrado.");
      }
      throw error;
    }
  }

  async getCompletionsByUser(userId: string): Promise<QuizCompletion[]> {
    return prisma.quiz_completions.findMany({
      where: { user_id: userId },
      include: {
        quiz: true,
      },
      orderBy: {
        completed_at: "desc",
      },
    }) as any;
  }
}

export const quizzesRepository = new PrismaQuizzesRepository();
export default quizzesRepository;
