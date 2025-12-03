import BookService from "../services/BookService.js";
import BorrowService from "../services/BorrowService.js";
import UserService from "../services/UserService.js";

const bookService = new BookService();
const borrowService = new BorrowService();
const userService = new UserService();

class LibrarianController {
  static async getAllBooks(req, res, next) {
    try {
      const books = await bookService.searchBooks("");
      res.json(books);
    } catch (err) {
      next(err);
    }
  }

  static async getUserBorrows(req, res, next) {
    try {
      const { userId } = req.params;
      const borrows = await borrowService.getUserBorrows(userId);
      res.json(borrows);
    } catch (err) {
      next(err);
    }
  }

  static async getAllBorrows(req, res, next) {
    try {
      const borrows = await borrowService.getAllBorrows();
      res.json(borrows);
    } catch (err) {
      next(err);
    }
  }

  // User Management Endpoints
  static async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req, res, next) {
    try {
      const librarianUser = req.user;
      const user = await userService.createUser(librarianUser, req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const librarianUser = req.user;
      const { id } = req.params;
      const user = await userService.updateUser(librarianUser, id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const librarianUser = req.user;
      const { id } = req.params;
      await userService.deleteUser(librarianUser, id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const librarianUser = req.user;
      const { id } = req.params;
      const { role } = req.body;
      const user = await userService.updateUserRole(librarianUser, id, role);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default LibrarianController;
