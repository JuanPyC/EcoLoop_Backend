import { IProfilesRepository } from "../../../domain/repositories/IProfilesRepository";
import { verifyPassword, generateToken } from "../../../infrastructure/security/auth";

export class LoginUseCase {
  constructor(private profilesRepo: IProfilesRepository) {}

  async execute(email: string, password: string) {
    if (!email || !password) {
      throw new Error("email y password son requeridos");
    }

    const profile = await this.profilesRepo.findProfileByEmail(email);
    if (!profile) {
      throw new Error("Credenciales inválidas");
    }

    const isPasswordValid = await verifyPassword(password, profile.password_hash);
    if (!isPasswordValid) {
      throw new Error("Credenciales inválidas");
    }

    const token = generateToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    });

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        eco_points: profile.eco_points,
      },
    };
  }
}
