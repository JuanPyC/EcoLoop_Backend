import { Request, Response } from "express";
import { ListTransactionsUseCase } from "../../application/use-cases/transactions/ListTransactionsUseCase";
import { ScanQrUseCase } from "../../application/use-cases/transactions/ScanQrUseCase";
import { transactionsRepository } from "../../infrastructure/repositories/transactionsRepository";

export class TransactionsController {
  private listTransactionsUseCase = new ListTransactionsUseCase(transactionsRepository);
  private scanQrUseCase = new ScanQrUseCase(transactionsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const userId = req.query.user_id as string | undefined;
      const data = await this.listTransactionsUseCase.execute(userId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  scan = async (req: Request, res: Response) => {
    try {
      const { user_id, qr_code } = req.body;
      const result = await this.scanQrUseCase.execute(user_id, qr_code);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

export const transactionsController = new TransactionsController();
