import { IStationsRepository } from "../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../domain/entities";
import prisma from "../db/prismaClient";

export class PrismaStationsRepository implements IStationsRepository {
  async listStations(): Promise<WasteStation[]> {
    return prisma.waste_stations.findMany({
      include: { waste_bins: true },
      orderBy: { created_at: "desc" },
    }) as any;
  }

  async getStationById(id: string): Promise<WasteStation | null> {
    return prisma.waste_stations.findUnique({
      where: { id },
      include: { waste_bins: true },
    }) as any;
  }

  async createStation(data: any): Promise<WasteStation> {
    return prisma.waste_stations.create({ data }) as any;
  }

  async updateStation(id: string, data: any): Promise<WasteStation> {
    return prisma.waste_stations.update({ where: { id }, data }) as any;
  }

  async deleteStation(id: string): Promise<WasteStation> {
    return prisma.waste_stations.delete({ where: { id } }) as any;
  }
}

export const stationsRepository = new PrismaStationsRepository();
export default stationsRepository;
