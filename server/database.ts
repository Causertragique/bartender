// Use wrapper that handles missing better-sqlite3 gracefully
import db from "./database-wrapper";

// Tables are created in database-wrapper.ts
// Export the database instance
export default db;
