import { Router } from "express";
import authRoutes from "./auth.routes.js";
import bookRoutes from "./books.routes.js";
import borrowRoutes from "./borrows.routes.js";
import userRoutes from "./users.routes.js";
import librarianRoutes from "./librarians.routes.js";
import paymentRoutes from "./payments.routes.js";
import reservationRoutes from "./reservations.routes.js";
import notificationRoutes from "./notifications.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/borrow", borrowRoutes);
router.use("/users", userRoutes);
router.use("/librarians", librarianRoutes);
router.use("/payments", paymentRoutes);
router.use("/reservations", reservationRoutes);
router.use("/notifications", notificationRoutes);

export default router;
