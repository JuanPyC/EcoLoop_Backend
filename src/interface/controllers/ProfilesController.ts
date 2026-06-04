import { Request, Response } from "express";
import { profilesRepository } from "../../infrastructure/repositories/profilesRepository";

export class ProfilesController {
  list = async (req: Request, res: Response) => {
    try {
      const role = req.query.role as string | undefined;
      const data = await profilesRepository.listProfiles(role ? { role } : undefined);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await profilesRepository.getProfileById(req.params.id);
      if (!data) return res.status(404).json({ error: "Perfil no encontrado" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await profilesRepository.updateProfile(id, { ...req.body, updated_at: new Date() });
      return res.json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

export const profilesController = new ProfilesController();
export default profilesController;
