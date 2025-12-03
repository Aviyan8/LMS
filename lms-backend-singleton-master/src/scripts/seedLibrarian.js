import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { initDb } from "../db/index.js";
import UserRepository from "../repositories/UserRepository.js";
import UserFactory from "../domain/patterns/factory/UserFactory.js";

dotenv.config();

async function seedLibrarian() {
  try {
    // Initialize database
    await initDb();
    console.log("Database initialized");

    const userRepository = new UserRepository();

    // Check if librarian already exists
    const existingLibrarian = await userRepository.findByEmail(
      "admin@library.com"
    );
    if (existingLibrarian) {
      console.log("Librarian already exists with email: admin@library.com");
      console.log("Skipping seed...");
      process.exit(0);
    }

    // Create default librarian
    const passwordHash = await bcrypt.hash("admin123", 10);
    const librarian = UserFactory.createUser("LIBRARIAN", {
      name: "Library Admin",
      email: "admin@library.com",
      passwordHash,
    });

    const savedLibrarian = await userRepository.save(librarian);

    console.log("✅ Librarian seeded successfully!");
    console.log("Email: admin@library.com");
    console.log("Password: admin123");
    console.log("Role: LIBRARIAN");
    console.log("ID:", savedLibrarian.id);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding librarian:", error);
    process.exit(1);
  }
}

seedLibrarian();
