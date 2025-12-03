import dotenv from "dotenv";
import { initDb, getSequelize } from "../db/index.js";

dotenv.config();

async function migrateToUUID() {
  try {
    const sequelize = getSequelize();
    
    // Connect without initializing models
    await sequelize.authenticate();
    console.log("Connected to database");

    // Drop all tables to recreate with UUID
    console.log("Dropping existing tables...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.query("DROP TABLE IF EXISTS BorrowTransactions");
    await sequelize.query("DROP TABLE IF EXISTS Reservations");
    await sequelize.query("DROP TABLE IF EXISTS Books");
    await sequelize.query("DROP TABLE IF EXISTS Users");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    
    console.log("✅ Tables dropped. Now run the server to recreate with UUID.");
    console.log("Or run: npm run seed:librarian");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error migrating:", error);
    process.exit(1);
  }
}

// Initialize DB first, then migrate
initDb()
  .then(() => migrateToUUID())
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
