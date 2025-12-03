import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import UserFactory from "../domain/patterns/factory/UserFactory.js";

export default class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
    };
  }

  async getUserBorrowedCount(userId) {
    return await this.userRepository.getBorrowedCount(userId);
  }

  // Self-update method (users can update their own profile)
  async updateSelf(userId, userData) {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update allowed fields only (name, email, password)
    // Role and maxBorrowLimit cannot be changed by user
    if (userData.name) {
      user.name = userData.name;
    }
    
    if (userData.email) {
      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already taken by another user");
      }
      user.email = userData.email;
    }
    
    if (userData.password) {
      user.passwordHash = await bcrypt.hash(userData.password, 10);
    }

    // Save updated user
    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
    };
  }

  // Change password method (requires old password verification)
  async changePassword(userId, oldPassword, newPassword) {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash and set new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    // Save updated user
    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
    };
  }

  // User management methods (librarian only)
  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
    }));
  }

  async createUser(librarianUser, userData) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can create users");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password if provided
    const passwordHash = userData.password
      ? await bcrypt.hash(userData.password, 10)
      : await bcrypt.hash("password123", 10); // Default password

    // Create user using factory
    const user = UserFactory.createUser(userData.role, {
      name: userData.name,
      email: userData.email,
      passwordHash,
    });

    // Save to database
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      maxBorrowLimit: savedUser.maxBorrowLimit,
    };
  }

  async updateUser(librarianUser, userId, userData) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can update users");
    }

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update fields
    if (userData.name) user.name = userData.name;
    if (userData.email) {
      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already taken by another user");
      }
      user.email = userData.email;
    }
    if (userData.password) {
      user.passwordHash = await bcrypt.hash(userData.password, 10);
    }
    if (userData.role) {
      // Recreate user with new role using factory
      const updatedUser = UserFactory.createUser(userData.role, {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      });
      // Copy updated properties
      user.role = updatedUser.role;
      user.maxBorrowLimit = updatedUser.maxBorrowLimit;
    }

    // Save updated user
    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
    };
  }

  async deleteUser(librarianUser, userId) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can delete users");
    }

    // Prevent deleting self
    if (librarianUser.id === userId) {
      throw new Error("Cannot delete your own account");
    }

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete user
    await this.userRepository.delete(userId);
  }

  async updateUserRole(librarianUser, userId, newRole) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can update user roles");
    }

    // Prevent changing own role
    if (librarianUser.id === userId) {
      throw new Error("Cannot change your own role");
    }

    // Validate role
    if (!["STUDENT", "FACULTY", "LIBRARIAN"].includes(newRole)) {
      throw new Error("Invalid role");
    }

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update role using factory
    const updatedUser = UserFactory.createUser(newRole, {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });

    // Save updated user
    await this.userRepository.save(updatedUser);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      maxBorrowLimit: updatedUser.maxBorrowLimit,
    };
  }
}
