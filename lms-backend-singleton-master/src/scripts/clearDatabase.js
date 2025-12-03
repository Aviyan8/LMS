import dotenv from "dotenv";
import { initDb, getSequelize } from "../db/index.js";

dotenv.config();

async function clearDatabase() {
  try {
    await initDb();
    const sequelize = getSequelize();

    // Disable foreign key checks temporarily
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear tables in correct order (respecting foreign keys)
    // Note: Sequelize pluralizes table names by default
    await sequelize.query("DELETE FROM Notifications");
    await sequelize.query("DELETE FROM BorrowTransactions");
    await sequelize.query("DELETE FROM Reservations");
    await sequelize.query("DELETE FROM Books");
    await sequelize.query("DELETE FROM Users");

    // Reset auto-increment (not needed for UUID, but safe to include)
    console.log("All tables cleared!");

    // Re-enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
