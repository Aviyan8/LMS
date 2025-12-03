import { Router } from "express";
import BorrowController from "../controllers/BorrowController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware); // All borrow routes require authentication

router.post("/", BorrowController.borrowBook);
router.post("/return", BorrowController.returnBook);
router.get("/", BorrowController.getUserBorrows);

export default router;

