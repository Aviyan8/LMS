import AuthService from "../services/AuthService.js";
import envConfig from "../config/env.config.js";

const authService = new AuthService();

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await authService.registerUser(req.body);
      
      // Set JWT token in HttpOnly cookie
      res.cookie("token", result.token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
      });

      // Return user without token
      res.status(201).json({
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      
      // Set JWT token in HttpOnly cookie
      res.cookie("token", result.token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
      });

      // Return user without token
      res.json({
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      // Clear the token cookie
      res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0, // Immediately expire
      });

      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;

