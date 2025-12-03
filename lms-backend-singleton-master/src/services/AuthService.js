import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import UserRepository from "../repositories/UserRepository.js";
import UserFactory from "../domain/patterns/factory/UserFactory.js";

export default class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser({ name, email, password, role }) {
    // Prevent LIBRARIAN registration - only librarians can create librarian accounts
    if (role === "LIBRARIAN") {
      throw new Error(
        "Cannot register as LIBRARIAN. Only librarians can create librarian accounts."
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create domain user using factory
    const user = UserFactory.createUser(role, {
      name,
      email,
      passwordHash,
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(savedUser);

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        maxBorrowLimit: savedUser.maxBorrowLimit,
      },
      token,
    };
  }

  async login({ email, password }) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        maxBorrowLimit: user.maxBorrowLimit,
      },
      token,
    };
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      envConfig.jwtSecret,
      { expiresIn: envConfig.jwtExpiresIn }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, envConfig.jwtSecret);
  }
}
