import { Profile } from "../entities";

export interface IProfilesRepository {
  listProfiles(filter?: { role?: string }): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | null>;
  findProfileByEmail(email: string): Promise<Profile | null>;
  createProfile(data: {
    email: string;
    password_hash: string;
    full_name?: string | null;
    role?: string;
    eco_points?: number;
  }): Promise<Profile>;
  updateProfile(id: string, data: any): Promise<Profile>;
}
