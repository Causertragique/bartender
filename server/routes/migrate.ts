import { RequestHandler } from "express";
import db from "../database";

// Route pour migrer les données de localStorage vers SQLite
// POST /api/migrate - Migrer les données depuis localStorage
export const migrateFromLocalStorage: RequestHandler = (req, res) => {
  try {
    const { products, recipes } = req.body;
    
    const transaction = db.transaction(() => {
      // Migrer les produits
      if (products && Array.isArray(products)) {
        const insertProduct = db.prepare(`
          INSERT OR REPLACE INTO products (id, name, category, price, quantity, unit, lastRestocked, imageUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const product of products) {
          insertProduct.run(
            product.id,
            product.name,
            product.category,
            product.price,
            product.quantity || 0,
            product.unit || "bottles",
            product.lastRestocked || null,
            product.imageUrl || null
          );
        }
      }
      
      // Migrer les recettes
      if (recipes && Array.isArray(recipes)) {
        const insertRecipe = db.prepare(`
          INSERT OR REPLACE INTO recipes (id, name, price, category, servingSize)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        const insertIngredient = db.prepare(`
          INSERT OR REPLACE INTO recipe_ingredients (id, recipeId, productId, productName, quantity, unit)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const recipe of recipes) {
          insertRecipe.run(
            recipe.id,
            recipe.name,
            recipe.price,
            recipe.category,
            recipe.servingSize || null
          );
          
          // Supprimer les anciens ingrédients
          db.prepare("DELETE FROM recipe_ingredients WHERE recipeId = ?").run(recipe.id);
          
          // Ajouter les nouveaux ingrédients
          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            for (const ingredient of recipe.ingredients) {
              const ingredientId = `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              insertIngredient.run(
                ingredientId,
                recipe.id,
                ingredient.productId,
                ingredient.productName,
                ingredient.quantity,
                ingredient.unit
              );
            }
          }
        }
      }
    });
    
    transaction();
    
    res.json({ success: true, message: "Migration completed successfully" });
  } catch (error) {
    console.error("Error migrating data:", error);
    res.status(500).json({ error: "Failed to migrate data" });
  }
};

