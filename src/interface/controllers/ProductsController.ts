import { Request, Response } from "express";
import { ListProductsUseCase } from "../../application/use-cases/products/ListProductsUseCase";
import { productsRepository } from "../../infrastructure/repositories/productsRepository";

export class ProductsController {
  private listProductsUseCase = new ListProductsUseCase(productsRepository);

  list = async (req: Request, res: Response) => {
    try {
      const available = req.query.available === "true";
      const category = req.query.category as string | undefined;
      const data = await this.listProductsUseCase.execute({
        available: req.query.available ? available : undefined,
        category,
      });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const data = await productsRepository.getProductById(req.params.id);
      if (!data) return res.status(404).json({ error: "Producto no encontrado" });
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, description, points_cost, stock, category, image_url } = req.body;
      if (!name || !points_cost || !category) {
        return res.status(400).json({ error: "name, points_cost y category son requeridos" });
      }
      const data = await productsRepository.createProduct({
        name,
        description,
        points_cost,
        stock: stock || 0,
        category,
        image_url,
      });
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = await productsRepository.updateProduct(id, { ...req.body, updated_at: new Date() });
      return res.json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await productsRepository.deleteProduct(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  };
}

export const productsController = new ProductsController();
