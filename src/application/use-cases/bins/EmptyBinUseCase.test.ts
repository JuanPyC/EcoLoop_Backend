import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmptyBinUseCase } from "./EmptyBinUseCase";
import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError } from "../../../domain/errors";
import { WasteBin } from "../../../domain/entities";

describe("EmptyBinUseCase", () => {
  const mockBinsRepo = {
    findBinByQr: vi.fn(),
    findBinById: vi.fn(),
    updateBinCapacity: vi.fn(),
    emptyBin: vi.fn(),
  } as unknown as IBinsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully empty the waste bin if it exists", async () => {
    const useCase = new EmptyBinUseCase(mockBinsRepo);
    const mockBin: WasteBin = {
      id: "bin-123",
      station_id: "station-456",
      waste_type: "recyclable",
      capacity_percentage: 95,
      needs_attention: true,
      qr_code: "QR-TEST-001",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const emptiedBin: WasteBin = {
      ...mockBin,
      capacity_percentage: 0,
      needs_attention: false,
      updated_at: new Date(),
    };

    vi.mocked(mockBinsRepo.findBinById).mockResolvedValueOnce(mockBin);
    vi.mocked(mockBinsRepo.emptyBin).mockResolvedValueOnce(emptiedBin);

    const result = await useCase.execute("bin-123");

    expect(mockBinsRepo.findBinById).toHaveBeenCalledWith("bin-123");
    expect(mockBinsRepo.emptyBin).toHaveBeenCalledWith("bin-123");
    expect(result).toEqual(emptiedBin);
  });

  it("should throw NotFoundError if the waste bin does not exist", async () => {
    const useCase = new EmptyBinUseCase(mockBinsRepo);

    vi.mocked(mockBinsRepo.findBinById).mockResolvedValueOnce(null);

    await expect(useCase.execute("non-existent-bin")).rejects.toThrow(NotFoundError);
    expect(mockBinsRepo.findBinById).toHaveBeenCalledWith("non-existent-bin");
    expect(mockBinsRepo.emptyBin).not.toHaveBeenCalled();
  });

  it("should throw error if ID is empty", async () => {
    const useCase = new EmptyBinUseCase(mockBinsRepo);

    await expect(useCase.execute("")).rejects.toThrow("El ID del contenedor es requerido");
    expect(mockBinsRepo.findBinById).not.toHaveBeenCalled();
  });
});
