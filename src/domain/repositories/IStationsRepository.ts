import { WasteStation } from "../entities";

export interface IStationsRepository {
  listStations(): Promise<WasteStation[]>;
  getStationById(id: string): Promise<WasteStation | null>;
  createStation(data: any): Promise<WasteStation>;
  updateStation(id: string, data: any): Promise<WasteStation>;
  deleteStation(id: string): Promise<WasteStation>;
}
