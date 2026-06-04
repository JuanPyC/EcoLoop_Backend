import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompleteQuizUseCase } from "./CompleteQuizUseCase";
import { IQuizzesRepository } from "../../../domain/repositories/IQuizzesRepository";
import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

describe("CompleteQuizUseCase", () => {
  const mockQuizzesRepo = {
    listQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    createQuizCompletion: vi.fn(),
    getCompletionsByUser: vi.fn(),
  } as unknown as IQuizzesRepository;

  const mockProfilesRepo = {
    listProfiles: vi.fn(),
    getProfileById: vi.fn(),
    findProfileByEmail: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as IProfilesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully complete a quiz and update user points", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    const mockQuiz = {
      id: "quiz-1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: true,
      created_at: new Date(),
      quiz_questions: [
        { id: "q1", quiz_id: "quiz-1", question: "Q1", correct_answer: "A", wrong_answer_1: "B", wrong_answer_2: "C", wrong_answer_3: "D", order_index: 1, created_at: new Date() },
        { id: "q2", quiz_id: "quiz-1", question: "Q2", correct_answer: "A", wrong_answer_1: "B", wrong_answer_2: "C", wrong_answer_3: "D", order_index: 2, created_at: new Date() },
      ],
    };

    const mockProfile = {
      id: "user-1",
      email: "test@user.com",
      password_hash: "hash",
      full_name: "Test User",
      role: "user" as const,
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockCompletion = {
      id: "comp-1",
      user_id: "user-1",
      quiz_id: "quiz-1",
      score: 1,
      points_earned: 5,
      completed_at: new Date(),
    };

    const updatedProfile = {
      ...mockProfile,
      eco_points: 55,
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);
    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockQuizzesRepo.getCompletionsByUser).mockResolvedValueOnce([]);
    vi.mocked(mockQuizzesRepo.createQuizCompletion).mockResolvedValueOnce(mockCompletion);
    vi.mocked(mockProfilesRepo.updateProfile).mockResolvedValueOnce(updatedProfile);

    const result = await useCase.execute({
      user_id: "user-1",
      quiz_id: "quiz-1",
      score: 1,
    });

    expect(mockQuizzesRepo.getQuizById).toHaveBeenCalledWith("quiz-1");
    expect(mockProfilesRepo.getProfileById).toHaveBeenCalledWith("user-1");
    expect(mockQuizzesRepo.getCompletionsByUser).toHaveBeenCalledWith("user-1");
    expect(mockQuizzesRepo.createQuizCompletion).toHaveBeenCalledWith({
      user_id: "user-1",
      quiz_id: "quiz-1",
      score: 1,
      points_earned: 5, // Math.round((1 / 2) * 10) = 5
    });
    expect(mockProfilesRepo.updateProfile).toHaveBeenCalledWith("user-1", {
      eco_points: 55,
    });
    expect(result).toEqual({
      completion: mockCompletion,
      points_earned: 5,
      total_points: 55,
    });
  });

  it("should throw ValidationError if parameters are missing", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    await expect(useCase.execute({ user_id: "", quiz_id: "q", score: 1 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ user_id: "u", quiz_id: "", score: 1 })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ user_id: "u", quiz_id: "q", score: undefined as any })).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError if score is negative", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    await expect(useCase.execute({ user_id: "u", quiz_id: "q", score: -1 })).rejects.toThrow(ValidationError);
  });

  it("should throw NotFoundError if quiz does not exist", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(null);

    await expect(useCase.execute({ user_id: "user-1", quiz_id: "quiz-1", score: 1 })).rejects.toThrow(NotFoundError);
  });

  it("should throw ValidationError if quiz is not active", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    const mockQuiz = {
      id: "quiz-1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: false,
      created_at: new Date(),
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);

    await expect(useCase.execute({ user_id: "user-1", quiz_id: "quiz-1", score: 1 })).rejects.toThrow(ValidationError);
  });

  it("should throw NotFoundError if profile does not exist", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    const mockQuiz = {
      id: "quiz-1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: true,
      created_at: new Date(),
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);
    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(null);

    await expect(useCase.execute({ user_id: "user-1", quiz_id: "quiz-1", score: 1 })).rejects.toThrow(NotFoundError);
  });

  it("should throw ValidationError if user has already completed the quiz", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    const mockQuiz = {
      id: "quiz-1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: true,
      created_at: new Date(),
    };

    const mockProfile = {
      id: "user-1",
      email: "test@user.com",
      password_hash: "hash",
      full_name: "Test User",
      role: "user" as const,
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);
    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockQuizzesRepo.getCompletionsByUser).mockResolvedValueOnce([
      { id: "comp-1", user_id: "user-1", quiz_id: "quiz-1", score: 1, points_earned: 5, completed_at: new Date() },
    ]);

    await expect(useCase.execute({ user_id: "user-1", quiz_id: "quiz-1", score: 1 })).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError if score is greater than total questions", async () => {
    const useCase = new CompleteQuizUseCase(mockQuizzesRepo, mockProfilesRepo);

    const mockQuiz = {
      id: "quiz-1",
      title: "Quiz 1",
      description: "Desc 1",
      points_reward: 10,
      is_active: true,
      created_at: new Date(),
      quiz_questions: [
        { id: "q1", quiz_id: "quiz-1", question: "Q1", correct_answer: "A", wrong_answer_1: "B", wrong_answer_2: "C", wrong_answer_3: "D", order_index: 1, created_at: new Date() },
      ],
    };

    const mockProfile = {
      id: "user-1",
      email: "test@user.com",
      password_hash: "hash",
      full_name: "Test User",
      role: "user" as const,
      eco_points: 50,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(mockQuizzesRepo.getQuizById).mockResolvedValueOnce(mockQuiz);
    vi.mocked(mockProfilesRepo.getProfileById).mockResolvedValueOnce(mockProfile);
    vi.mocked(mockQuizzesRepo.getCompletionsByUser).mockResolvedValueOnce([]);

    await expect(useCase.execute({ user_id: "user-1", quiz_id: "quiz-1", score: 2 })).rejects.toThrow(ValidationError);
  });
});
