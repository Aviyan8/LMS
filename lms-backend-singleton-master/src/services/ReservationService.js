import ReservationRepository from "../repositories/ReservationRepository.js";
import BookRepository from "../repositories/BookRepository.js";
import UserRepository from "../repositories/UserRepository.js";

export default class ReservationService {
  constructor() {
    this.reservationRepository = new ReservationRepository();
    this.bookRepository = new BookRepository();
    this.userRepository = new UserRepository();
  }

  async createReservation(userId, bookId) {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if book exists
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Check if user already has a pending reservation for this book
    const existingReservations = await this.reservationRepository.findByUserId(
      userId
    );
    const existingReservation = existingReservations.find(
      (r) => r.bookId === bookId && r.status === "PENDING"
    );
    if (existingReservation) {
      throw new Error("You already have a pending reservation for this book");
    }

    // Create reservation
    const reservation = await this.reservationRepository.create(userId, bookId);
    return {
      id: reservation.id,
      userId: reservation.userId,
      bookId: reservation.bookId,
      status: reservation.status,
      createdAt: reservation.createdAt,
    };
  }

  async getUserReservations(userId) {
    const reservations = await this.reservationRepository.findByUserId(userId);
    return reservations.map((r) => ({
      id: r.id,
      bookId: r.bookId,
      book: r.Book
        ? {
            id: r.Book.id,
            title: r.Book.title,
            author: r.Book.author,
            isbn: r.Book.isbn,
            available: r.Book.available,
          }
        : null,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async cancelReservation(reservationId, userId) {
    const reservation = await this.reservationRepository.findById(
      reservationId
    );
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Check if reservation belongs to user
    if (reservation.userId !== userId) {
      throw new Error("Unauthorized: This reservation does not belong to you");
    }

    // Only allow canceling pending reservations
    if (reservation.status !== "PENDING") {
      throw new Error("Only pending reservations can be cancelled");
    }

    await this.reservationRepository.updateStatus(reservationId, "CANCELLED");
    return { message: "Reservation cancelled successfully" };
  }
}
