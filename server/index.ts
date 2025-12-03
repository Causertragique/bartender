import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  register,
  login,
  verify2FA,
  setup2FA,
  enable2FA,
  disable2FA,
  syncFirebaseUser,
} from "./routes/auth";
import {
  getSalesPrediction,
  getReorderRecommendations,
  getProfitabilityAnalysis,
  getPriceOptimization,
  getInsights,
  getPromotionRecommendations,
  getStockoutPrediction,
  getMenuOptimization,
  getTemporalTrends,
  getDynamicPricing,
  getRevenueForecast,
  getSalesReport,
  getTaxReport,
  getFoodWinePairing,
} from "./routes/analytics";
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
import { searchImages } from "./routes/image-search";
import { handleSAQScrape } from "./routes/saq-scraper";
import {
  createConnectionToken,
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
} from "./routes/stripe";
import {
  getStripeKeys,
  saveStripeKeys,
  deleteStripeKeys,
} from "./routes/stripe-keys";
import { authenticateToken } from "./middleware/auth";

export function createServer() {
  console.log("[Express] createServer() appelé");
  const app = express();
  console.log("[Express] Application Express créée");

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`[Express] ${req.method} ${req.url}`);
    next();
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // SAQ product scraper endpoint
  app.get("/api/saq-scrape", handleSAQScrape);

  // Authentication endpoints
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/verify-2fa", verify2FA);
  app.get("/api/auth/2fa/setup", setup2FA);
  app.post("/api/auth/2fa/enable", enable2FA);
  app.post("/api/auth/2fa/disable", disable2FA);
  app.post("/api/auth/firebase-sync", syncFirebaseUser);

  // Image search endpoint (server-side only, API key stays secure)
  app.post("/api/image-search", searchImages);

  // Stripe Terminal endpoints
  app.post("/api/stripe/connection-token", createConnectionToken);
  app.post("/api/stripe/create-payment-intent", createPaymentIntent);
  app.post("/api/stripe/confirm-payment", confirmPayment);
  app.post("/api/stripe/cancel-payment", cancelPayment);

  // Stripe Keys management endpoints
  app.get("/api/stripe-keys", authenticateToken, getStripeKeys);
  app.post("/api/stripe-keys", authenticateToken, saveStripeKeys);
  app.delete("/api/stripe-keys", authenticateToken, deleteStripeKeys);

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

  // Analytics & AI endpoints
  app.get("/api/analytics/sales-prediction", authenticateToken, getSalesPrediction);
  app.get("/api/analytics/reorder-recommendations", authenticateToken, getReorderRecommendations);
  app.get("/api/analytics/profitability", authenticateToken, getProfitabilityAnalysis);
  app.get("/api/analytics/price-optimization", authenticateToken, getPriceOptimization);
  app.get("/api/analytics/insights", authenticateToken, getInsights);
  app.get("/api/analytics/promotion-recommendations", authenticateToken, getPromotionRecommendations);
  app.get("/api/analytics/stockout-prediction", authenticateToken, getStockoutPrediction);
  app.get("/api/analytics/menu-optimization", authenticateToken, getMenuOptimization);
  app.get("/api/analytics/temporal-trends", authenticateToken, getTemporalTrends);
  app.get("/api/analytics/dynamic-pricing", authenticateToken, getDynamicPricing);
  app.get("/api/analytics/revenue-forecast", authenticateToken, getRevenueForecast);
  app.get("/api/analytics/sales-report", authenticateToken, getSalesReport);
  app.get("/api/analytics/tax-report", authenticateToken, getTaxReport);
  app.get("/api/analytics/food-wine-pairing", authenticateToken, getFoodWinePairing);
  app.post("/api/analytics/food-wine-pairing", authenticateToken, getFoodWinePairing);

  // 404 handler for API routes
  app.use("/api", (req, res) => {
    console.log(`[Express] 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found" });
  });

  console.log("[Express] Toutes les routes configurées, retour de l'app");
  return app;
}
