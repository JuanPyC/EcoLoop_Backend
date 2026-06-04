import { ITransactionsRepository } from "../../domain/repositories/ITransactionsRepository";
import { Transaction, WasteBin } from "../../domain/entities";
import prisma from "../db/prismaClient";

export class PrismaTransactionsRepository implements ITransactionsRepository {
  async findTransactions(filter?: { user_id?: string }): Promise<Transaction[]> {
    const where: any = {};
    if (filter?.user_id) where.user_id = filter.user_id;
    return prisma.transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { full_name: true, email: true } },
        bin: { select: { waste_type: true, qr_code: true } },
      },
    }) as any;
  }

  async findBinByQr(qr: string): Promise<WasteBin | null> {
    return prisma.waste_bins.findUnique({ where: { qr_code: qr } }) as any;
  }

  async createTransaction(data: {
    user_id: string;
    bin_id: string;
    points_earned: number;
    waste_type: any;
  }): Promise<Transaction> {
    return prisma.transactions.create({ data }) as any;
  }

  async getProfilePoints(user_id: string): Promise<number> {
    const p = await prisma.profiles.findUnique({
      where: { id: user_id },
      select: { eco_points: true },
    });
    return p?.eco_points ?? 0;
  }

  async updateProfilePoints(user_id: string, newPoints: number): Promise<any> {
    return prisma.profiles.update({
      where: { id: user_id },
      data: { eco_points: newPoints },
    });
  }
}

export const transactionsRepository = new PrismaTransactionsRepository();
export default transactionsRepository;
