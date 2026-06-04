import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";

export class CreateStationUseCase {
  constructor(private stationsRepo: IStationsRepository) {}

  async execute(data: { name: string; location: string; description?: string }) {
    if (!data.name || !data.location) {
      throw new Error("name y location son requeridos");
    }
    return this.stationsRepo.createStation(data);
  }
}
