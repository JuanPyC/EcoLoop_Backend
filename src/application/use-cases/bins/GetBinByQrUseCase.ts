import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError } from "../../../domain/errors";

export class GetBinByQrUseCase {
  constructor(private binsRepo: IBinsRepository) {}

  async execute(qrCode: string) {
    if (!qrCode) {
      throw new Error("Código QR es requerido");
    }

    const bin = await this.binsRepo.findBinByQr(qrCode);
    if (!bin) {
      throw new NotFoundError("Contenedor no encontrado");
    }

    return bin;
  }
}
