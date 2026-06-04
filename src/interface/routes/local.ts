import { Router } from "express";
import { localController } from "../controllers/LocalController";
import { authMiddleware } from "../../infrastructure/security/auth";

export const localRouter = Router();

localRouter.get("/:table", authMiddleware, localController.getAll);
localRouter.get("/:table/:id", authMiddleware, localController.getById);
localRouter.post("/:table", authMiddleware, localController.create);
localRouter.put("/:table/:id", authMiddleware, localController.update);
localRouter.delete("/:table/:id", authMiddleware, localController.delete);
