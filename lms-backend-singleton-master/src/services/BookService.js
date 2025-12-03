import BookRepository from "../repositories/BookRepository.js";
import ReservationRepository from "../repositories/ReservationRepository.js";
import LibraryCatalogue from "../domain/patterns/singleton/LibraryCatalogue.js";
import Book from "../domain/entities/Book.js";

export default class BookService {
  constructor() {
    this.bookRepository = new BookRepository();
    this.reservationRepository = new ReservationRepository();
  }

  async searchBooks(query) {
    let books;
    if (!query || query.trim() === "") {
      books = await this.bookRepository.findAll();
    } else {
      books = await this.bookRepository.search(query);
    }

    // Get reservation counts for all books
    const booksWithReservations = await Promise.all(
      books.map(async (book) => {
        const reservations = await this.reservationRepository.findByBookId(
          book.id
        );
        return this.toDTO(book, reservations.length > 0);
      })
    );

    // Sort by title to ensure consistent ordering
    return booksWithReservations.sort((a, b) => a.title.localeCompare(b.title));
  }

  async addBook(data, librarianUser) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can add books");
    }

    // Check if ISBN already exists
    const existingBook = await this.bookRepository.findByIsbn(data.isbn);
    if (existingBook) {
      throw new Error("Book with this ISBN already exists");
    }

    // Create domain book
    const book = new Book({
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      totalCopies: data.totalCopies || 1,
      availableCopies: data.availableCopies || data.totalCopies || 1,
    });

    // Save to database
    const savedBook = await this.bookRepository.save(book);

    // Add to singleton catalogue
    LibraryCatalogue.addBook(savedBook);

    // New book has no reservations
    return this.toDTO(savedBook, false);
  }

  async removeBook(bookId, librarianUser) {
    // Check if user is librarian
    if (librarianUser.role !== "LIBRARIAN") {
      throw new Error("Only librarians can remove books");
    }

    // Check if book exists
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    // Remove from database
    await this.bookRepository.delete(bookId);

    // Remove from singleton catalogue
    LibraryCatalogue.removeBook(bookId);
  }

  async getBookById(bookId) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    const reservations = await this.reservationRepository.findByBookId(bookId);
    return this.toDTO(book, reservations.length > 0);
  }

  toDTO(book, hasReservations = false) {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      hasReservations,
    };
  }
}
