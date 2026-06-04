import { describe, it, expect, vi } from "vitest";
import { CreateStationUseCase } from "./CreateStationUseCase";
import { IStationsRepository } from "../../../domain/repositories/IStationsRepository";
import { WasteStation } from "../../../domain/entities";

describe("CreateStationUseCase", () => {
  it("should create a station successfully when name and location are provided", async () => {
    const mockStation: WasteStation = {
      id: "station-1",
      name: "Estación Centro",
      location: "Calle 10 # 5-20",
      description: "Estación principal",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockRepo = {
      listStations: vi.fn(),
      getStationById: vi.fn(),
      createStation: vi.fn().mockResolvedValue(mockStation),
      updateStation: vi.fn(),
      deleteStation: vi.fn(),
    } as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);
    const data = {
      name: "Estación Centro",
      location: "Calle 10 # 5-20",
      description: "Estación principal",
    };

    const result = await useCase.execute(data);

    expect(mockRepo.createStation).toHaveBeenCalledWith(data);
    expect(result).toEqual(mockStation);
  });

  it("should throw an error when name is missing", async () => {
    const mockRepo = {
      createStation: vi.fn(),
    } as unknown as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "", location: "Calle 10" })
    ).rejects.toThrow("name y location son requeridos");

    expect(mockRepo.createStation).not.toHaveBeenCalled();
  });

  it("should throw an error when location is missing", async () => {
    const mockRepo = {
      createStation: vi.fn(),
    } as unknown as IStationsRepository;

    const useCase = new CreateStationUseCase(mockRepo);

    await expect(
      useCase.execute({ name: "Estación Centro", location: "" })
    ).rejects.toThrow("name y location son requeridos");

    expect(mockRepo.createStation).not.toHaveBeenCalled();
  });
});
