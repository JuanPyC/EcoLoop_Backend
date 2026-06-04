import { Router } from "express";
import { profilesController } from "../controllers/ProfilesController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const profilesRouter = Router();

/**
 * @openapi
 * /api/profiles:
 *   get:
 *     summary: Listar todos los perfiles
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, worker, admin]
 *     responses:
 *       200:
 *         description: Lista de perfiles
 */
profilesRouter.get("/", profilesController.list);

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     summary: Obtener perfil por ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       404:
 *         description: No encontrado
 */
profilesRouter.get("/:id", profilesController.getById);

/**
 * @openapi
 * /api/profiles/{id}:
 *   put:
 *     summary: Actualizar perfil
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
profilesRouter.put("/:id", authMiddleware, profilesController.update);
