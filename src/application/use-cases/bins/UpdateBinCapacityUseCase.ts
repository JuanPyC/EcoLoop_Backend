import { IBinsRepository } from "../../../domain/repositories/IBinsRepository";
import { ValidationError, NotFoundError } from "../../../domain/errors";

export class UpdateBinCapacityUseCase {
  constructor(private binsRepo: IBinsRepository) {}

  async execute(id: string, capacity: number, currentWeight: number) {
    if (capacity === undefined || capacity === null || typeof capacity !== "number") {
      throw new ValidationError("La capacidad es requerida y debe ser un número");
    }
    if (currentWeight === undefined || currentWeight === null || typeof currentWeight !== "number") {
      throw new ValidationError("El peso actual es requerido y debe ser un número");
    }

    if (capacity < 0 || capacity > 100) {
      throw new ValidationError("La capacidad debe estar entre 0 y 100");
    }

    if (currentWeight < 0) {
      throw new ValidationError("El peso no puede ser negativo");
    }

    const binExists = await this.binsRepo.findBinById(id);
    if (!binExists) {
      throw new NotFoundError("Contenedor no encontrado");
    }

    return this.binsRepo.updateBinCapacity(id, capacity, currentWeight);
  }
}
