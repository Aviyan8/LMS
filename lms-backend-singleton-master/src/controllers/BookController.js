import BookService from "../services/BookService.js";

const bookService = new BookService();

class BookController {
  static async searchBooks(req, res, next) {
    try {
      const { q } = req.query;
      const books = await bookService.searchBooks(q || "");
      res.json(books);
    } catch (err) {
      next(err);
    }
  }

  static async addBook(req, res, next) {
    try {
      const librarianUser = req.user; // from authMiddleware
      const book = await bookService.addBook(req.body, librarianUser);
      res.status(201).json(book);
    } catch (err) {
      next(err);
    }
  }

  static async removeBook(req, res, next) {
    try {
      const librarianUser = req.user;
      await bookService.removeBook(req.params.id, librarianUser);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async getBookById(req, res, next) {
    try {
      const book = await bookService.getBookById(req.params.id);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }
}

export default BookController;

