import { getSequelize } from "../db/index.js";
import BorrowTransaction from "../domain/entities/BorrowTransaction.js";
import BookRepository from "./BookRepository.js";
import UserRepository from "./UserRepository.js";

export default class BorrowTransactionRepository {
  constructor() {
    // Don't access models in constructor - they're not initialized yet
    this.bookRepository = new BookRepository();
    this.userRepository = new UserRepository();
  }

  get sequelize() {
    return getSequelize();
  }

  get BorrowTransactionModel() {
    return this.sequelize.models.BorrowTransaction;
  }

  async findById(id) {
    const row = await this.BorrowTransactionModel.findByPk(id, {
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
    });
    if (!row) return null;

    const book = await this.bookRepository.findById(row.bookId);
    const user = await this.userRepository.findById(row.userId);

    return new BorrowTransaction({
      id: row.id,
      user,
      book,
      borrowDate: row.borrowDate,
      dueDate: row.dueDate,
      returnDate: row.returnDate,
      status: row.status,
      baseFee: row.baseFee || 0,
      lateFee: row.lateFee || 0,
      reservationFee: row.reservationFee || 0,
      paymentStatus: row.paymentStatus || "PENDING",
      paymentId: row.paymentId || null,
      paidAt: row.paidAt || null,
    });
  }

  async findByUserAndBook(userId, bookId) {
    const row = await this.BorrowTransactionModel.findOne({
      where: {
        userId,
        bookId,
        status: "BORROWED",
      },
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
    });
    if (!row) return null;

    const book = await this.bookRepository.findById(row.bookId);
    const user = await this.userRepository.findById(row.userId);

    return new BorrowTransaction({
      id: row.id,
      user,
      book,
      borrowDate: row.borrowDate,
      dueDate: row.dueDate,
      returnDate: row.returnDate,
      status: row.status,
      baseFee: row.baseFee || 0,
      lateFee: row.lateFee || 0,
      reservationFee: row.reservationFee || 0,
      paymentStatus: row.paymentStatus || "PENDING",
      paymentId: row.paymentId || null,
      paidAt: row.paidAt || null,
    });
  }

  async findByUserId(userId) {
    const rows = await this.BorrowTransactionModel.findAll({
      where: { userId },
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
    });

    const transactions = [];
    for (const row of rows) {
      const book = await this.bookRepository.findById(row.bookId);
      const user = await this.userRepository.findById(row.userId);
      transactions.push(
        new BorrowTransaction({
          id: row.id,
          user,
          book,
          borrowDate: row.borrowDate,
          dueDate: row.dueDate,
          returnDate: row.returnDate,
          status: row.status,
          baseFee: row.baseFee || 0,
          lateFee: row.lateFee || 0,
          reservationFee: row.reservationFee || 0,
          paymentStatus: row.paymentStatus || "PENDING",
          paymentId: row.paymentId || null,
          paidAt: row.paidAt || null,
        })
      );
    }
    return transactions;
  }

  async findAll() {
    const rows = await this.BorrowTransactionModel.findAll({
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
      order: [["borrowDate", "DESC"]], // Most recent first
    });

    const transactions = [];
    for (const row of rows) {
      const book = await this.bookRepository.findById(row.bookId);
      const user = await this.userRepository.findById(row.userId);
      transactions.push(
        new BorrowTransaction({
          id: row.id,
          user,
          book,
          borrowDate: row.borrowDate,
          dueDate: row.dueDate,
          returnDate: row.returnDate,
          status: row.status,
          baseFee: row.baseFee || 0,
          lateFee: row.lateFee || 0,
          reservationFee: row.reservationFee || 0,
          paymentStatus: row.paymentStatus || "PENDING",
          paymentId: row.paymentId || null,
          paidAt: row.paidAt || null,
        })
      );
    }
    return transactions;
  }

  async save(transaction) {
    if (!transaction.id) {
      const created = await this.BorrowTransactionModel.create({
        userId: transaction.user.id,
        bookId: transaction.book.id,
        borrowDate: transaction.borrowDate,
        dueDate: transaction.dueDate,
        returnDate: transaction.returnDate,
        status: transaction.status,
        baseFee: transaction.baseFee || 0,
        lateFee: transaction.lateFee || 0,
        reservationFee: transaction.reservationFee || 0,
        paymentStatus: transaction.paymentStatus || "PENDING",
        paymentId: transaction.paymentId || null,
        paidAt: transaction.paidAt || null,
      });
      transaction.id = created.id;
      return transaction;
    } else {
      await this.BorrowTransactionModel.update(
        {
          userId: transaction.user.id,
          bookId: transaction.book.id,
          borrowDate: transaction.borrowDate,
          dueDate: transaction.dueDate,
          returnDate: transaction.returnDate,
          status: transaction.status,
          baseFee: transaction.baseFee || 0,
          lateFee: transaction.lateFee || 0,
          reservationFee: transaction.reservationFee || 0,
          paymentStatus: transaction.paymentStatus || "PENDING",
          paymentId: transaction.paymentId || null,
          paidAt: transaction.paidAt || null,
        },
        { where: { id: transaction.id } }
      );
      return transaction;
    }
  }
}
