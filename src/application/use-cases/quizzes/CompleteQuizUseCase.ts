import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export interface CompleteQuizInput {
  user_id: string;
  quiz_id: string;
  score: number;
}

export class CompleteQuizUseCase {
  constructor(
    private quizzesRepo: IQuizzesRepository,
    private profilesRepo: IProfilesRepository
  ) {}

  async execute(input: CompleteQuizInput) {
    const { user_id, quiz_id, score } = input;

    if (!user_id || !quiz_id || score === undefined || score === null) {
      throw new ValidationError("user_id, quiz_id y score son requeridos");
    }

    if (score < 0) {
      throw new ValidationError("El score no puede ser negativo");
    }

    // 1. Get quiz and verify it exists
    const quiz = await this.quizzesRepo.getQuizById(quiz_id);
    if (!quiz) {
      throw new NotFoundError("Quiz no encontrado");
    }

    // 2. Verify quiz is active
    if (!quiz.is_active) {
      throw new ValidationError("Este quiz no está activo");
    }

    // 3. Get profile and verify it exists
    const profile = await this.profilesRepo.getProfileById(user_id);
    if (!profile) {
      throw new NotFoundError("Perfil no encontrado");
    }

    // 4. Verify user has not already completed this quiz
    const completions = await this.quizzesRepo.getCompletionsByUser(user_id);
    const alreadyCompleted = completions.some((c) => c.quiz_id === quiz_id);
    if (alreadyCompleted) {
      throw new ValidationError("El usuario ya ha completado este quiz");
    }

    // 5. Calculate points earned securely
    const totalQuestions = quiz.quiz_questions?.length || 0;
    let pointsEarned = 0;
    if (totalQuestions > 0) {
      if (score > totalQuestions) {
        throw new ValidationError("El score no puede ser mayor que el número total de preguntas");
      }
      pointsEarned = Math.round((score / totalQuestions) * quiz.points_reward);
    } else {
      pointsEarned = quiz.points_reward;
    }

    // 6. Create quiz completion
    const completion = await this.quizzesRepo.createQuizCompletion({
      user_id,
      quiz_id,
      score,
      points_earned: pointsEarned,
    });

    // 7. Update profile's eco points
    const updatedProfile = await this.profilesRepo.updateProfile(user_id, {
      eco_points: profile.eco_points + pointsEarned,
    });

    return {
      completion,
      points_earned: pointsEarned,
      total_points: updatedProfile.eco_points,
    };
  }
}
