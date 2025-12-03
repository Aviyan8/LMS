export default class BorrowTransaction {
  constructor({
    id,
    user,
    book,
    borrowDate,
    dueDate,
    returnDate,
    status,
    baseFee,
    lateFee,
    reservationFee,
    paymentStatus,
    paymentId,
    paidAt,
  }) {
    this.id = id;
    this.user = user;
    this.book = book;
    this.borrowDate = borrowDate;
    this.dueDate = dueDate;
    this.returnDate = returnDate;
    this.status = status || "BORROWED";
    this.baseFee = baseFee || 0;
    this.lateFee = lateFee || 0;
    this.reservationFee = reservationFee || 0;
    this.paymentStatus = paymentStatus || "PENDING";
    this.paymentId = paymentId || null;
    this.paidAt = paidAt || null;
  }

  markReturned(returnDate) {
    this.returnDate = returnDate;
    this.status = "RETURNED";
  }

  isOverdue(currentDate) {
    return !this.returnDate && currentDate > this.dueDate;
  }
}
