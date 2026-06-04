import { Router } from "express";
import { transactionsController } from "../controllers/TransactionsController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const transactionsRouter = Router();

/**
 * @openapi
 * /api/v1/transactions:
 *   get:
 *     summary: Listar transacciones
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
transactionsRouter.get("/", transactionsController.list);

/**
 * @openapi
 * /api/v1/transactions/scan:
 *   post:
 *     summary: Registrar escaneo de QR (flujo completo de reciclaje)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, qr_code]
 *             properties:
 *               user_id:
 *                 type: string
 *               qr_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transacción registrada exitosamente
 *       400:
 *         description: QR inválido o datos incorrectos
 */
transactionsRouter.post("/scan", authMiddleware, transactionsController.scan);
