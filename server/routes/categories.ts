import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { db } from "../db.js";
import { categories, inventoryItemTypeSchema } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

const categoryRoutes = Router();

const CategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  type: inventoryItemTypeSchema,
});

categoryRoutes.get("/", async (req, res) => {
  try {
    const itemType = req.query.type
      ? inventoryItemTypeSchema.parse(req.query.type)
      : undefined;
    const categoryList = await storage.getCategories(itemType);
    res.json(categoryList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Tipo de categoria inválido" });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

categoryRoutes.post("/", async (req, res) => {
  try {
    const validatedData = CategorySchema.parse(req.body);
    const newCategory = await storage.createCategory(validatedData);
    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    res.status(400).json({
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    });
  }
});

categoryRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CategorySchema.partial().parse(req.body);

    await db.update(categories).set(validatedData).where(eq(categories.id, id));

    const updatedCategory = await storage.getCategory(id);
    if (!updatedCategory) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

categoryRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const productList = await storage.getProducts();
    const productsUsingCategory = productList.filter((product) => product.categoryId === id);

    if (productsUsingCategory.length > 0) {
      return res.status(400).json({
        error: `Não é possível excluir esta categoria. Existem ${productsUsingCategory.length} produtos vinculados a ela.`,
      });
    }

    await db.delete(categories).where(eq(categories.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export { categoryRoutes };
