import { Request, Response, NextFunction } from "express";

/**
 * Middleware to extract user ID from request
 * In a real app, this would verify JWT tokens or session cookies
 * For now, we'll use a simple header-based approach
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Get user ID from header (in production, use JWT or session)
  const userId = req.headers["x-user-id"] as string;
  const username = req.headers["x-username"] as string;

  if (!userId && !username) {
    // Try to get from localStorage token (sent as Authorization header)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        // In a real app, verify JWT token here
        // For now, we'll use a simple approach with localStorage token
        const token = authHeader.replace("Bearer ", "");
        // Decode token or verify session
        // For simplicity, we'll expect the client to send userId in header
      } catch (error) {
        return res.status(401).json({ error: "Invalid authentication token" });
      }
    } else {
      return res.status(401).json({ error: "Authentication required" });
    }
  }

  // Attach user info to request
  (req as any).userId = userId;
  (req as any).username = username;

  next();
}

/**
 * Get user ID from request (can be from header, token, or session)
 */
export function getUserId(req: Request): string | null {
  const userId = req.headers["x-user-id"] as string;
  if (userId) return userId;

  // Try to get from auth token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "").trim();
      // For now, if token is "authenticated", we need to get username from header
      // In production, this would be a JWT token with userId embedded
      if (token === "authenticated") {
        const username = req.headers["x-username"] as string;
        if (username) {
          // Get user ID from database using username
          const db = require("../database").default;
          const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as any;
          return user?.id || null;
        }
      }
      // Decode simple token (format: userId:username or just userId)
      if (token.includes(":")) {
        return token.split(":")[0];
      }
      // If token is just userId
      if (token && token !== "authenticated") {
        return token;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return null;
}

/**
 * Middleware to authenticate requests using token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Attach user info to request
  (req as any).user = { userId };
  next();
}

/**
 * Get username from request
 */
export function getUsername(req: Request): string | null {
  const username = req.headers["x-username"] as string;
  if (username) return username;

  // Try to get from auth token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // In production, decode JWT token here
  }

  return null;
}

