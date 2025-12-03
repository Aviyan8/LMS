import { Router } from "express";
import UserController from "../controllers/UserController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware); // All user routes require authentication

router.get("/profile", UserController.getProfile);
router.get("/borrowed-count", UserController.getBorrowedCount);
router.put("/profile", UserController.updateProfile);
router.patch("/profile/password", UserController.changePassword);

export default router;

