import BorrowService from "../services/BorrowService.js";

const borrowService = new BorrowService();

class BorrowController {
  static async borrowBook(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.body;
      const result = await borrowService.borrowBook(userId, bookId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async returnBook(req, res, next) {
    try {
      const userId = req.user.id;
      const { bookId } = req.body;
      const result = await borrowService.returnBook(userId, bookId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getUserBorrows(req, res, next) {
    try {
      const userId = req.user.id;
      const borrows = await borrowService.getUserBorrows(userId);
      res.json(borrows);
    } catch (err) {
      next(err);
    }
  }
}

export default BorrowController;

