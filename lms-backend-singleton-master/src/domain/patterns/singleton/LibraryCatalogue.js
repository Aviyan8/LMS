import Book from "../../entities/Book.js";

class LibraryCatalogue {
  constructor() {
    if (LibraryCatalogue.instance) {
      return LibraryCatalogue.instance;
    }
    this.books = new Map(); // key: id, value: Book instance
    LibraryCatalogue.instance = this;
  }

  addBook(book) {
    this.books.set(book.id, book);
  }

  removeBook(bookId) {
    this.books.delete(bookId);
  }

  findByTitle(title) {
    return Array.from(this.books.values()).filter((b) =>
      b.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  findByIsbn(isbn) {
    return Array.from(this.books.values()).find((b) => b.isbn === isbn) || null;
  }

  updateBook(book) {
    this.books.set(book.id, book);
  }
}

const instance = new LibraryCatalogue();
export default instance;

