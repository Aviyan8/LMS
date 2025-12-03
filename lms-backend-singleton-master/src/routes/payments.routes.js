import { Router } from "express";
import PaymentController from "../controllers/PaymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Webhook endpoint - no auth needed, handled in app.js with raw body
router.post("/webhook", PaymentController.handleWebhook);

// Protected routes
router.use(authMiddleware);

router.post("/create-intent", PaymentController.createPaymentIntent);
router.get("/verify", PaymentController.verifyPayment);

export default router;
