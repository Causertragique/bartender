import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleProcessPayment } from "./routes/payment";
import { handleSAQScrape } from "./routes/saq-scraper";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
} from "./routes/products";
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "./routes/recipes";
import { migrateFromLocalStorage } from "./routes/migrate";
import {
  register,
  login,
  verify2FA,
  setup2FA,
  enable2FA,
  disable2FA,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Payment processing endpoint
  app.post("/api/process-payment", handleProcessPayment);

  // SAQ product scraper endpoint
  app.get("/api/saq-scrape", handleSAQScrape);

  // Products API
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProduct);
  app.post("/api/products", createProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);
  app.patch("/api/products/:id/quantity", updateProductQuantity);

  // Recipes API
  app.get("/api/recipes", getRecipes);
  app.get("/api/recipes/:id", getRecipe);
  app.post("/api/recipes", createRecipe);
  app.put("/api/recipes/:id", updateRecipe);
  app.delete("/api/recipes/:id", deleteRecipe);

  // Migration endpoint
  app.post("/api/migrate", migrateFromLocalStorage);

  // Authentication endpoints
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/verify-2fa", verify2FA);
  app.get("/api/auth/2fa/setup", setup2FA);
  app.post("/api/auth/2fa/enable", enable2FA);
  app.post("/api/auth/2fa/disable", disable2FA);

  return app;
}
