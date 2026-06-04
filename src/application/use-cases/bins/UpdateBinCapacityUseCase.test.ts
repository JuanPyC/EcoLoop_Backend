import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateBinCapacityUseCase } from "./UpdateBinCapacityUseCase";
import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";
import { WasteBin } from "../../../domain/entities";

describe("UpdateBinCapacityUseCase", () => {
  const mockBinsRepo = {
    findBinByQr: vi.fn(),
    findBinById: vi.fn(),
    updateBinCapacity: vi.fn(),
    emptyBin: vi.fn(),
  } as unknown as IBinsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully update capacity and weight if inputs are valid", async () => {
    const useCase = new UpdateBinCapacityUseCase(mockBinsRepo);
    const mockBin: WasteBin = {
      id: "bin-123",
      station_id: "station-456",
      waste_type: "recyclable",
      capacity_percentage: 20,
      needs_attention: false,
      qr_code: "QR-TEST-001",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedBin: WasteBin = {
      ...mockBin,
      capacity_percentage: 85,
      needs_attention: false,
      updated_at: new Date(),
    };

    vi.mocked(mockBinsRepo.findBinById).mockResolvedValueOnce(mockBin);
    vi.mocked(mockBinsRepo.updateBinCapacity).mockResolvedValueOnce(updatedBin);

    const result = await useCase.execute("bin-123", 85, 12.5);

    expect(mockBinsRepo.findBinById).toHaveBeenCalledWith("bin-123");
    expect(mockBinsRepo.updateBinCapacity).toHaveBeenCalledWith("bin-123", 85, 12.5);
    expect(result).toEqual(updatedBin);
  });

  it("should throw ValidationError if capacity is less than 0", async () => {
    const useCase = new UpdateBinCapacityUseCase(mockBinsRepo);

    await expect(useCase.execute("bin-123", -5, 10)).rejects.toThrow(ValidationError);
    expect(mockBinsRepo.updateBinCapacity).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if capacity is greater than 100", async () => {
    const useCase = new UpdateBinCapacityUseCase(mockBinsRepo);

    await expect(useCase.execute("bin-123", 105, 10)).rejects.toThrow(ValidationError);
    expect(mockBinsRepo.updateBinCapacity).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if weight is negative", async () => {
    const useCase = new UpdateBinCapacityUseCase(mockBinsRepo);

    await expect(useCase.execute("bin-123", 50, -2)).rejects.toThrow(ValidationError);
    expect(mockBinsRepo.updateBinCapacity).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if the waste bin does not exist", async () => {
    const useCase = new UpdateBinCapacityUseCase(mockBinsRepo);

    vi.mocked(mockBinsRepo.findBinById).mockResolvedValueOnce(null);

    await expect(useCase.execute("non-existent-bin", 50, 10)).rejects.toThrow(NotFoundError);
    expect(mockBinsRepo.findBinById).toHaveBeenCalledWith("non-existent-bin");
    expect(mockBinsRepo.updateBinCapacity).not.toHaveBeenCalled();
  });
});
