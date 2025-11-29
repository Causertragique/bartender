import { RequestHandler } from "express";
import db from "../database";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

// Configuration TOTP
authenticator.options = {
  step: 30, // Codes valides pendant 30 secondes
  window: 1, // Tolérance d'une fenêtre
};

// POST /api/auth/register - Créer un compte
export const register: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Register attempt:", { username, hasPassword: !!password });

    if (!username || !password) {
      return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (existing) {
      return res.status(400).json({ error: "Ce nom d'utilisateur existe déjà" });
    }

    // Hasher le mot de passe (simple hash pour l'exemple, utiliser bcrypt en production)
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = db.prepare(`
      INSERT INTO users (id, username, password)
      VALUES (?, ?, ?)
    `).run(userId, username, hashedPassword);

    console.log("User created successfully:", userId);

    res.status(201).json({ success: true, userId });
  } catch (error: any) {
    console.error("Error registering user:", error);
    const errorMessage = error?.message || "Erreur lors de la création du compte";
    res.status(500).json({ error: errorMessage });
  }
};

// POST /api/auth/login - Vérifier le mot de passe
export const login: RequestHandler = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont requis" });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, hashedPassword);

    if (!user) {
      return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const userObj = user as any;
    
    res.json({
      success: true,
      requiresTwoFactor: userObj.twoFactorEnabled === 1,
      userId: userObj.id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// POST /api/auth/verify-2fa - Vérifier le code 2FA
export const verify2FA: RequestHandler = (req, res) => {
  try {
    const { username, code } = req.body;

    if (!username || !code) {
      return res.status(400).json({ error: "Le nom d'utilisateur et le code sont requis" });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: "La double authentification n'est pas activée pour cet utilisateur" });
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return res.status(401).json({ error: "Code de double authentification invalide" });
    }

    res.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ error: "Failed to verify 2FA code" });
  }
};

// GET /api/auth/2fa/setup - Générer le secret et QR code pour configurer le 2FA
export const setup2FA: RequestHandler = async (req, res) => {
  try {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Générer un nouveau secret
    const secret = authenticator.generateSecret();
    const serviceName = "La Réserve";
    const accountName = username;

    // Générer l'URL TOTP
    const otpAuthUrl = authenticator.keyuri(accountName, serviceName, secret);

    // Générer le QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Sauvegarder temporairement le secret (l'utilisateur doit confirmer avec un code)
    // On ne l'active pas encore

    res.json({
      secret,
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
};

// POST /api/auth/2fa/enable - Activer le 2FA après vérification du code
export const enable2FA: RequestHandler = (req, res) => {
  try {
    const { username, secret, code } = req.body;

    if (!username || !secret || !code) {
      return res.status(400).json({ error: "Username, secret, and code are required" });
    }

    // Vérifier que le code est valide
    const isValid = authenticator.verify({
      token: code,
      secret: secret,
    });

    if (!isValid) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Activer le 2FA pour l'utilisateur
    db.prepare(`
      UPDATE users 
      SET twoFactorSecret = ?, twoFactorEnabled = 1, updatedAt = datetime('now')
      WHERE username = ?
    `).run(secret, username);

    res.json({ success: true });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ error: "Failed to enable 2FA" });
  }
};

// POST /api/auth/2fa/disable - Désactiver le 2FA
export const disable2FA: RequestHandler = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, hashedPassword) as any;

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Désactiver le 2FA
    db.prepare(`
      UPDATE users 
      SET twoFactorSecret = NULL, twoFactorEnabled = 0, updatedAt = datetime('now')
      WHERE username = ?
    `).run(username);

    res.json({ success: true });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
};

