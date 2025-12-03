import AuthService from "../services/AuthService.js";
import UserRepository from "../repositories/UserRepository.js";

const authService = new AuthService();
const userRepository = new UserRepository();

export default async function authMiddleware(req, res, next) {
  try {
    // Try to get token from cookie first (cookie-based auth)
    let token = req.cookies?.token;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
    const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Load user
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

