import { RequestHandler } from "express";
import db from "../database";

// GET /api/products - Récupérer tous les produits
export const getProducts: RequestHandler = (req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products ORDER BY name ASC").all();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// GET /api/products/:id - Récupérer un produit par ID
export const getProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// POST /api/products - Créer un nouveau produit
export const createProduct: RequestHandler = (req, res) => {
  try {
    const { id, name, category, price, quantity, unit, lastRestocked, imageUrl } = req.body;
    
    if (!name || !category || price === undefined || quantity === undefined || !unit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const productId = id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    db.prepare(`
      INSERT INTO products (id, name, category, price, quantity, unit, lastRestocked, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(productId, name, category, price, quantity, unit, lastRestocked || null, imageUrl || null);
    
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// PUT /api/products/:id - Mettre à jour un produit
export const updateProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity, unit, lastRestocked, imageUrl } = req.body;
    
    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    db.prepare(`
      UPDATE products 
      SET name = ?, category = ?, price = ?, quantity = ?, unit = ?, 
          lastRestocked = ?, imageUrl = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(name, category, price, quantity, unit, lastRestocked || null, imageUrl || null, id);
    
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// DELETE /api/products/:id - Supprimer un produit
export const deleteProduct: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// PATCH /api/products/:id/quantity - Mettre à jour uniquement la quantité
export const updateProductQuantity: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ error: "Quantity is required" });
    }
    
    db.prepare(`
      UPDATE products 
      SET quantity = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(quantity, id);
    
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.json(product);
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res.status(500).json({ error: "Failed to update product quantity" });
  }
};

