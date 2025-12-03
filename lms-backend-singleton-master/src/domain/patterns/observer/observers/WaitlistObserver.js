import IObserver from "../IObserver.js";
// import ReservationRepository, NotificationService etc.

export default class WaitlistObserver extends IObserver {
  constructor(reservationRepository, notificationService) {
    super();
    this.reservationRepository = reservationRepository;
    this.notificationService = notificationService;
  }

  async update(book, user) {
    const nextReservation = await this.reservationRepository.getNextPending(
      book.id
    );
    if (nextReservation) {
      // Notify the user
      await this.notificationService.notifyUser(
        nextReservation.userId,
        `Book "${book.title}" is now available for you.`
      );
      // Mark reservation as NOTIFIED
      await this.reservationRepository.updateStatus(
        nextReservation.id,
        "NOTIFIED"
      );
    }
  }
}
