import { RequestHandler } from "express";
import db from "../database";
import { getUserId } from "../middleware/auth.ts";

/**
 * GET /api/stripe-keys - Get Stripe keys for current user
 */
export const getStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const keys = db.prepare("SELECT * FROM stripe_keys WHERE userId = ?").get(userId);

    if (!keys) {
      return res.json({
        secretKey: "",
        publishableKey: "",
        terminalLocationId: "",
        isTestMode: true,
      });
    }

    // Return keys (in production, decrypt if encrypted)
    res.json({
      secretKey: (keys as any).secretKey || "",
      publishableKey: (keys as any).publishableKey || "",
      terminalLocationId: (keys as any).terminalLocationId || "",
      isTestMode: (keys as any).isTestMode === 1,
    });
  } catch (error: any) {
    console.error("Error getting Stripe keys:", error);
    res.status(500).json({
      error: "Failed to get Stripe keys",
      message: error.message,
    });
  }
};

/**
 * POST /api/stripe-keys - Save or update Stripe keys for current user
 */
export const saveStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { secretKey, publishableKey, terminalLocationId, isTestMode } = req.body;

    if (!secretKey || !publishableKey) {
      return res.status(400).json({ error: "Secret key and publishable key are required" });
    }

    // Validate Stripe key format
    if (!secretKey.startsWith("sk_") || !publishableKey.startsWith("pk_")) {
      return res.status(400).json({ error: "Invalid Stripe key format" });
    }

    // Check if keys already exist for this user
    const existing = db.prepare("SELECT * FROM stripe_keys WHERE userId = ?").get(userId);

    if (existing) {
      // Update existing keys
      const id = (existing as any).id;
      db.prepare(`
        UPDATE stripe_keys
        SET secretKey = ?, publishableKey = ?, terminalLocationId = ?, isTestMode = ?, updatedAt = datetime('now')
        WHERE id = ?
      `).run(secretKey, publishableKey, terminalLocationId || null, isTestMode ? 1 : 0, id);
    } else {
      // Insert new keys
      const id = `stripe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      db.prepare(`
        INSERT INTO stripe_keys (id, userId, secretKey, publishableKey, terminalLocationId, isTestMode)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, userId, secretKey, publishableKey, terminalLocationId || null, isTestMode ? 1 : 0);
    }

    res.json({ success: true, message: "Stripe keys saved successfully" });
  } catch (error: any) {
    console.error("Error saving Stripe keys:", error);
    res.status(500).json({
      error: "Failed to save Stripe keys",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/stripe-keys - Delete Stripe keys for current user
 */
export const deleteStripeKeys: RequestHandler = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    db.prepare("DELETE FROM stripe_keys WHERE userId = ?").run(userId);

    res.json({ success: true, message: "Stripe keys deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting Stripe keys:", error);
    res.status(500).json({
      error: "Failed to delete Stripe keys",
      message: error.message,
    });
  }
};

