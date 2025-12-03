import ReservationService from "../services/ReservationService.js";

const reservationService = new ReservationService();

class ReservationController {
  static async createReservation(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.body;

      if (!bookId) {
        return res.status(400).json({ error: "Book ID is required" });
      }

      const reservation = await reservationService.createReservation(
        userId,
        bookId
      );
      res.status(201).json(reservation);
    } catch (err) {
      next(err);
    }
  }

  static async getUserReservations(req, res, next) {
    try {
      const userId = req.user.id;
      const reservations = await reservationService.getUserReservations(userId);
      res.json(reservations);
    } catch (err) {
      next(err);
    }
  }

  static async cancelReservation(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await reservationService.cancelReservation(id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default ReservationController;
