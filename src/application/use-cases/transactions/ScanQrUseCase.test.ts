import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScanQrUseCase } from "./ScanQrUseCase";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";
import { Transaction, WasteBin } from "../../../domain/entities";

describe("ScanQrUseCase", () => {
  const mockTransactionsRepo = {
    findTransactions: vi.fn(),
    findBinByQr: vi.fn(),
    createTransaction: vi.fn(),
    getProfilePoints: vi.fn(),
    updateProfilePoints: vi.fn(),
  } as unknown as ITransactionsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wasteTypes = [
    { type: "recyclable" as const, expectedPoints: 10 },
    { type: "organic" as const, expectedPoints: 8 },
    { type: "non_recyclable" as const, expectedPoints: 5 },
  ];

  for (const { type, expectedPoints } of wasteTypes) {
    it(`should successfully process scanning a QR code for a ${type} waste bin and award ${expectedPoints} points`, async () => {
      const useCase = new ScanQrUseCase(mockTransactionsRepo);

      const mockBin: WasteBin = {
        id: "bin-123",
        station_id: "station-456",
        waste_type: type,
        capacity_percentage: 20,
        needs_attention: false,
        qr_code: `qr-code-${type}`,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockTransaction: Transaction = {
        id: "tx-789",
        user_id: "user-123",
        bin_id: "bin-123",
        points_earned: expectedPoints,
        waste_type: type,
        created_at: new Date(),
      };

      vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(mockBin);
      vi.mocked(mockTransactionsRepo.createTransaction).mockResolvedValueOnce(mockTransaction);
      vi.mocked(mockTransactionsRepo.getProfilePoints).mockResolvedValueOnce(50);
      vi.mocked(mockTransactionsRepo.updateProfilePoints).mockResolvedValueOnce({});

      const result = await useCase.execute("user-123", `qr-code-${type}`);

      expect(mockTransactionsRepo.findBinByQr).toHaveBeenCalledWith(`qr-code-${type}`);
      expect(mockTransactionsRepo.createTransaction).toHaveBeenCalledWith({
        user_id: "user-123",
        bin_id: "bin-123",
        points_earned: expectedPoints,
        waste_type: type,
      });
      expect(mockTransactionsRepo.getProfilePoints).toHaveBeenCalledWith("user-123");
      expect(mockTransactionsRepo.updateProfilePoints).toHaveBeenCalledWith("user-123", 50 + expectedPoints);

      expect(result).toEqual({
        transaction: mockTransaction,
        points_earned: expectedPoints,
        total_points: 50 + expectedPoints,
        message: `¡Excelente! Ganaste ${expectedPoints} EcoPoints por reciclar ${type}`,
      });
    });
  }

  it("should throw an error when user_id is empty", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);

    await expect(useCase.execute("", "qr-code-abc")).rejects.toThrow("user_id y qr_code son requeridos");
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw an error when qr_code is empty", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);

    await expect(useCase.execute("user-123", "")).rejects.toThrow("user_id y qr_code son requeridos");
    expect(mockTransactionsRepo.findBinByQr).not.toHaveBeenCalled();
  });

  it("should throw an error when QR code is not found", async () => {
    const useCase = new ScanQrUseCase(mockTransactionsRepo);

    vi.mocked(mockTransactionsRepo.findBinByQr).mockResolvedValueOnce(null);

    await expect(useCase.execute("user-123", "non-existent-qr")).rejects.toThrow(
      "Código QR inválido o no encontrado"
    );
    expect(mockTransactionsRepo.findBinByQr).toHaveBeenCalledWith("non-existent-qr");
    expect(mockTransactionsRepo.createTransaction).not.toHaveBeenCalled();
  });
});
