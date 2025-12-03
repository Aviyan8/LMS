import { Router } from "express";
import BookController from "../controllers/BookController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateBook } from "../middleware/validateRequest.js";

const router = Router();

router.get("/", BookController.searchBooks);
router.get("/:id", BookController.getBookById);
router.post("/", authMiddleware, validateBook, BookController.addBook);
router.delete("/:id", authMiddleware, BookController.removeBook);

export default router;

