import { WasteBin } from "../entities";

export interface IBinsRepository {
  findBinByQr(qrCode: string): Promise<WasteBin | null>;
  findBinById(id: string): Promise<WasteBin | null>;
  updateBinCapacity(id: string, capacity: number, currentWeight: number): Promise<WasteBin>;
  emptyBin(id: string): Promise<WasteBin>;
}
