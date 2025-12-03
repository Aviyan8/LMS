import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { validateRegister, validateLogin } from "../middleware/validateRequest.js";

const router = Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/logout", AuthController.logout);

export default router;

