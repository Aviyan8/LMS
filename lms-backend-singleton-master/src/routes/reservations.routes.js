import { Router } from "express";
import ReservationController from "../controllers/ReservationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", ReservationController.createReservation);
router.get("/", ReservationController.getUserReservations);
router.delete("/:id", ReservationController.cancelReservation);

export default router;
