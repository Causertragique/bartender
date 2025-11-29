import { RequestHandler } from "express";
import db from "../database";

// GET /api/recipes - Récupérer toutes les recettes
export const getRecipes: RequestHandler = (req, res) => {
  try {
    const recipes = db.prepare("SELECT * FROM recipes ORDER BY name ASC").all();
    
    // Récupérer les ingrédients pour chaque recette
    const recipesWithIngredients = recipes.map((recipe: any) => {
      const ingredients = db.prepare(`
        SELECT * FROM recipe_ingredients WHERE recipeId = ?
      `).all(recipe.id);
      
      return {
        ...recipe,
        ingredients: ingredients.map((ing: any) => ({
          productId: ing.productId,
          productName: ing.productName,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      };
    });
    
    res.json(recipesWithIngredients);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// GET /api/recipes/:id - Récupérer une recette par ID
export const getRecipe: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id);
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    const ingredients = db.prepare(`
      SELECT * FROM recipe_ingredients WHERE recipeId = ?
    `).all(id);
    
    res.json({
      ...recipe,
      ingredients: ingredients.map((ing: any) => ({
        productId: ing.productId,
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};

// POST /api/recipes - Créer une nouvelle recette
export const createRecipe: RequestHandler = (req, res) => {
  try {
    const { name, price, category, ingredients, servingSize } = req.body;
    
    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipeId = `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer la recette
    db.prepare(`
      INSERT INTO recipes (id, name, price, category, servingSize)
      VALUES (?, ?, ?, ?, ?)
    `).run(recipeId, name, price, category, servingSize || null);
    
    // Ajouter les ingrédients
    if (ingredients && Array.isArray(ingredients)) {
      const insertIngredient = db.prepare(`
        INSERT INTO recipe_ingredients (id, recipeId, productId, productName, quantity, unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const ingredient of ingredients) {
        const ingredientId = `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        insertIngredient.run(
          ingredientId,
          recipeId,
          ingredient.productId,
          ingredient.productName,
          ingredient.quantity,
          ingredient.unit
        );
      }
    }
    
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(recipeId);
    const recipeIngredients = db.prepare(`
      SELECT * FROM recipe_ingredients WHERE recipeId = ?
    `).all(recipeId);
    
    res.status(201).json({
      ...recipe,
      ingredients: recipeIngredients.map((ing: any) => ({
        productId: ing.productId,
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
};

// PUT /api/recipes/:id - Mettre à jour une recette
export const updateRecipe: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, ingredients, servingSize } = req.body;
    
    const existing = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    // Mettre à jour la recette
    db.prepare(`
      UPDATE recipes 
      SET name = ?, price = ?, category = ?, servingSize = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(name, price, category, servingSize || null, id);
    
    // Supprimer les anciens ingrédients
    db.prepare("DELETE FROM recipe_ingredients WHERE recipeId = ?").run(id);
    
    // Ajouter les nouveaux ingrédients
    if (ingredients && Array.isArray(ingredients)) {
      const insertIngredient = db.prepare(`
        INSERT INTO recipe_ingredients (id, recipeId, productId, productName, quantity, unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const ingredient of ingredients) {
        const ingredientId = `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        insertIngredient.run(
          ingredientId,
          id,
          ingredient.productId,
          ingredient.productName,
          ingredient.quantity,
          ingredient.unit
        );
      }
    }
    
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id);
    const recipeIngredients = db.prepare(`
      SELECT * FROM recipe_ingredients WHERE recipeId = ?
    `).all(id);
    
    res.json({
      ...recipe,
      ingredients: recipeIngredients.map((ing: any) => ({
        productId: ing.productId,
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
};

// DELETE /api/recipes/:id - Supprimer une recette
export const deleteRecipe: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare("DELETE FROM recipes WHERE id = ?").run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};

