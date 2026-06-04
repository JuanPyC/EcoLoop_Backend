import { Request, Response } from "express";
import { ListStationsUseCase } from "../../application/use-cases/stations/ListStationsUseCase";
import { stationsRepository } from "../../infrastructure/repositories/stationsRepository";

export class StationsController {
  private listStationsUseCase = new ListStationsUseCase(stationsRepository);

  list = async (_req: Request, res: Response) => {
    try {
      const data = await this.listStationsUseCase.execute();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await stationsRepository.getStationById(req.params.id);
      if (!data) return res.status(404).json({ error: "Estación no encontrada" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, location, description } = req.body;
      if (!name || !location) {
        return res.status(400).json({ error: "name y location son requeridos" });
      }
      const data = await stationsRepository.createStation({ name, location, description });
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await stationsRepository.updateStation(id, { ...req.body, updated_at: new Date() });
      return res.json(data);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await stationsRepository.deleteStation(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  };
}

export const stationsController = new StationsController();
