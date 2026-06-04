import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export class EmptyBinUseCase {
  constructor(private binsRepo: IBinsRepository) {}

  async execute(id: string) {
    if (!id) {
      throw new ValidationError("El ID del contenedor es requerido");
    }

    const binExists = await this.binsRepo.findBinById(id);
    if (!binExists) {
      throw new NotFoundError("Contenedor no encontrado");
    }

    return this.binsRepo.emptyBin(id);
  }
}
