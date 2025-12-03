import BookRepository from "../repositories/BookRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import BorrowTransactionRepository from "../repositories/BorrowTransactionRepository.js";
import BorrowTransaction from "../domain/entities/BorrowTransaction.js";
import LibraryCatalogue from "../domain/patterns/singleton/LibraryCatalogue.js";
import BookReturnSubject from "../domain/patterns/observer/BookReturnSubject.js";
import LibrarianObserver from "../domain/patterns/observer/observers/LibrarianObserver.js";
import CatalogueObserver from "../domain/patterns/observer/observers/CatalogueObserver.js";
import WaitlistObserver from "../domain/patterns/observer/observers/WaitlistObserver.js";
import ReservationRepository from "../repositories/ReservationRepository.js";
import NotificationService from "./NotificationService.js";
import FeeService from "./FeeService.js";
import { addDays, getCurrentDate } from "../utils/dateUtils.js";

export default class BorrowService {
  constructor() {
    this.bookRepository = new BookRepository();
    this.userRepository = new UserRepository();
    this.borrowTransactionRepository = new BorrowTransactionRepository();
    this.reservationRepository = new ReservationRepository();
    this.notificationService = new NotificationService();
    this.feeService = new FeeService();
    this.setupObservers();
  }

  setupObservers() {
    this.bookReturnSubject = new BookReturnSubject();
    this.bookReturnSubject.attach(new LibrarianObserver());
    this.bookReturnSubject.attach(new CatalogueObserver());
    this.bookReturnSubject.attach(
      new WaitlistObserver(this.reservationRepository, this.notificationService)
    );
  }

  async borrowBook(userId, bookId) {
    // Load domain user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check borrow limit
    const currentBorrowedCount = await this.userRepository.getBorrowedCount(
      userId
    );
    if (!user.canBorrow(currentBorrowedCount)) {
      throw new Error(
        `Borrow limit reached. Maximum ${user.maxBorrowLimit} books allowed.`
      );
    }

    // Load domain book
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Check availability
    if (!book.isAvailable()) {
      throw new Error("Book is not available");
    }

    // Check if book has pending/notified reservations
    const activeReservations = await this.reservationRepository.findByBookId(
      book.id
    );

    if (activeReservations.length > 0) {
      // Book is reserved - only the first person in queue can borrow
      const firstReservation = activeReservations[0];
      if (firstReservation.userId !== userId) {
        throw new Error(
          "This book has been reserved by another user. Please reserve it to be notified when available."
        );
      }
      // If it's the reserved user, they can borrow it - we'll cancel their reservation below
    }

    // Create borrow transaction
    const currentDate = getCurrentDate();
    const dueDate = addDays(currentDate, 14); // 14 days borrowing period

    const transaction = new BorrowTransaction({
      user,
      book,
      borrowDate: currentDate,
      dueDate,
      status: "BORROWED",
    });

    // Mark book as borrowed
    book.markAsBorrowed();

    // Cancel the borrower's reservation if they had one
    if (activeReservations.length > 0) {
      const userReservation = activeReservations.find(
        (r) => r.userId === userId
      );
      if (userReservation) {
        await this.reservationRepository.updateStatus(
          userReservation.id,
          "CANCELLED"
        );
      }
    }

    // Save to database
    await this.bookRepository.updateAvailability(book.id, book.availableCopies);
    await this.borrowTransactionRepository.save(transaction);

    // Update singleton catalogue
    LibraryCatalogue.updateBook(book);

    return {
      id: transaction.id,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
      borrowDate: transaction.borrowDate,
      dueDate: transaction.dueDate,
    };
  }

  async returnBook(userId, bookId) {
    // Find the transaction
    const transaction =
      await this.borrowTransactionRepository.findByUserAndBook(userId, bookId);
    if (!transaction) {
      throw new Error("Borrow transaction not found");
    }

    if (transaction.status === "RETURNED") {
      throw new Error("Book already returned");
    }

    // Calculate fees
    const currentDate = getCurrentDate();
    // Check if there are pending reservations for this book (optional feature)
    const pendingReservations = await this.reservationRepository.findByBookId(
      transaction.book.id
    );
    const hasReservation = pendingReservations.length > 0;
    const fees = this.feeService.calculateReturnFees(
      transaction,
      currentDate,
      hasReservation
    );

    // Mark as returned
    transaction.markReturned(currentDate);
    transaction.baseFee = fees.baseFee;
    transaction.lateFee = fees.lateFee;
    transaction.reservationFee = fees.reservationFee;

    // Mark book as returned
    transaction.book.markAsReturned();

    // Update database
    await this.bookRepository.updateAvailability(
      transaction.book.id,
      transaction.book.availableCopies
    );
    await this.borrowTransactionRepository.save(transaction);

    // Update singleton catalogue
    LibraryCatalogue.updateBook(transaction.book);

    // Notify observers
    this.bookReturnSubject.notify(transaction.book, transaction.user);

    return {
      id: transaction.id,
      returnDate: transaction.returnDate,
      fees: {
        baseFee: fees.baseFee,
        lateFee: fees.lateFee,
        reservationFee: fees.reservationFee,
        totalFee: fees.totalFee,
      },
    };
  }

  async getUserBorrows(userId) {
    const transactions = await this.borrowTransactionRepository.findByUserId(
      userId
    );
    return transactions.map((t) => ({
      id: t.id,
      book: {
        id: t.book.id,
        title: t.book.title,
        author: t.book.author,
      },
      borrowDate: t.borrowDate,
      dueDate: t.dueDate,
      returnDate: t.returnDate,
      status: t.status,
      fees: {
        baseFee: t.baseFee || 0,
        lateFee: t.lateFee || 0,
        reservationFee: t.reservationFee || 0,
        totalFee: (t.baseFee || 0) + (t.lateFee || 0) + (t.reservationFee || 0),
      },
      paymentStatus: t.paymentStatus || "PENDING",
      paidAt: t.paidAt || null,
    }));
  }

  async getAllBorrows() {
    const transactions = await this.borrowTransactionRepository.findAll();
    return transactions.map((t) => ({
      id: t.id,
      user: {
        id: t.user.id,
        name: t.user.name,
        email: t.user.email,
        role: t.user.role,
      },
      book: {
        id: t.book.id,
        title: t.book.title,
        author: t.book.author,
      },
      borrowDate: t.borrowDate,
      dueDate: t.dueDate,
      returnDate: t.returnDate,
      status: t.status,
      fees: {
        baseFee: t.baseFee || 0,
        lateFee: t.lateFee || 0,
        reservationFee: t.reservationFee || 0,
        totalFee: (t.baseFee || 0) + (t.lateFee || 0) + (t.reservationFee || 0),
      },
      paymentStatus: t.paymentStatus || "PENDING",
      paidAt: t.paidAt || null,
    }));
  }
}
