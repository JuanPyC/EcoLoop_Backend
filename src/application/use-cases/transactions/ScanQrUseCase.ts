import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository";

export class ScanQrUseCase {
  constructor(private transactionsRepo: ITransactionsRepository) {}

  async execute(userId: string, qrCode: string) {
    if (!userId || !qrCode) {
      throw new Error("user_id y qr_code son requeridos");
    }

    const bin = await this.transactionsRepo.findBinByQr(qrCode);
    if (!bin) {
      throw new Error("Código QR inválido o no encontrado");
    }

    const pointsMap: Record<string, number> = {
      recyclable: 10,
      organic: 8,
      non_recyclable: 5,
    };
    const pointsEarned = pointsMap[bin.waste_type] || 5;

    const transaction = await this.transactionsRepo.createTransaction({
      user_id: userId,
      bin_id: bin.id,
      points_earned: pointsEarned,
      waste_type: bin.waste_type,
    });

    const currentPoints = await this.transactionsRepo.getProfilePoints(userId);
    const newPoints = currentPoints + pointsEarned;
    await this.transactionsRepo.updateProfilePoints(userId, newPoints);

    return {
      transaction,
      points_earned: pointsEarned,
      total_points: newPoints,
      message: `¡Excelente! Ganaste ${pointsEarned} EcoPoints por reciclar ${bin.waste_type}`,
    };
  }
}
