// server/routes/categories.ts
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { db } from "../db";
import { categories } from "@shared/schema";
import { eq } from "drizzle-orm";

const categoryRoutes = Router();

const CategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  type: z.string().min(1, "Tipo da categoria é obrigatório"),
});

categoryRoutes.get("/", async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

categoryRoutes.post("/", async (req, res) => {
  try {
    const validatedData = CategorySchema.parse(req.body);

    const existingCategories = await storage.getCategories();
    const existingCategory = existingCategories.find(
      cat => cat.name.toLowerCase() === validatedData.name.toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({ 
        error: "Já existe uma categoria com este nome" 
      });
    }

    const newCategory = await storage.createCategory(validatedData);
    
    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Dados inválidos", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Erro interno do servidor ao criar categoria",
      message: error instanceof Error ? error.message : "Erro desconhecido"
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
    
    const products = await storage.getProducts();
    const productsUsingCategory = products.filter(p => p.categoryId === id);
    
    if (productsUsingCategory.length > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir esta categoria. Existem ${productsUsingCategory.length} produtos vinculados a ela.` 
      });
    }
    
    await db.delete(categories).where(eq(categories.id, id));
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export { categoryRoutes };