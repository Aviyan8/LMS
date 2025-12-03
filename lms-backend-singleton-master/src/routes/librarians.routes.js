import { Router } from "express";
import LibrarianController from "../controllers/LibrarianController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  validateCreateUser,
  validateUpdateUserRole,
} from "../middleware/validateRequest.js";

const router = Router();

router.use(authMiddleware); // All librarian routes require authentication

// Book management
router.get("/books", LibrarianController.getAllBooks);
router.get("/users/:userId/borrows", LibrarianController.getUserBorrows);
router.get("/borrows", LibrarianController.getAllBorrows);

// User management
router.get("/users", LibrarianController.getAllUsers);
router.post("/users", validateCreateUser, LibrarianController.createUser);
router.put("/users/:id", LibrarianController.updateUser);
router.delete("/users/:id", LibrarianController.deleteUser);
router.patch(
  "/users/:id/role",
  validateUpdateUserRole,
  LibrarianController.updateUserRole
);

export default router;
