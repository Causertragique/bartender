// Wrapper pour better-sqlite3 qui gère l'absence du module en dev
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, "../data/bartender.db");

// Créer le dossier data s'il n'existe pas
try {
  mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (error) {
  // Le dossier existe déjà
}

// Fonction pour initialiser la base de données
function initDatabase() {
  let Database: any;
  
  try {
    // Try to require better-sqlite3 (works in both CommonJS and ESM via createRequire)
    Database = require("better-sqlite3");
  } catch (error) {
    console.warn("better-sqlite3 not available, using mock database for development");
    // Mock database pour le développement local
    Database = class MockDatabase {
      constructor(path: string) {
        console.log(`[MOCK DB] Initialized at ${path}`);
      }
      pragma(key: string) {}
      exec(sql: string) {
        console.log(`[MOCK DB] Exec: ${sql.substring(0, 50)}...`);
      }
      prepare(sql: string) {
        return {
          run: (...args: any[]) => ({ changes: 0 }),
          get: (...args: any[]) => null,
          all: (...args: any[]) => [],
          scalar: (...args: any[]) => 0,
        };
      }
      transaction(fn: () => void) {
        fn();
      }
    };
  }

  // Initialiser la base de données
  const db = new Database(dbPath);

  // Activer les clés étrangères
  db.pragma("foreign_keys = ON");

  // Créer les tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      lastRestocked TEXT,
      imageUrl TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      servingSize INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipeId TEXT NOT NULL,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      productId TEXT,
      recipeId TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tabs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      creditCard TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      paidAt TEXT
    );

    CREATE TABLE IF NOT EXISTS tab_items (
      id TEXT PRIMARY KEY,
      tabId TEXT NOT NULL,
      productId TEXT,
      recipeId TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (tabId) REFERENCES tabs(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      twoFactorSecret TEXT,
      twoFactorEnabled INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_sales_createdAt ON sales(createdAt);
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipeId ON recipe_ingredients(recipeId);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  return db;
}

// Initialiser la base de données
const db = initDatabase();

export default db;
