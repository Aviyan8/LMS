export default class Book {
  constructor({ id, title, author, isbn, totalCopies, availableCopies }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.totalCopies = totalCopies;
    this.availableCopies = availableCopies;
  }

  isAvailable() {
    return this.availableCopies > 0;
  }

  markAsBorrowed() {
    if (this.availableCopies > 0) {
      this.availableCopies -= 1;
    }
  }

  markAsReturned() {
    if (this.availableCopies < this.totalCopies) {
      this.availableCopies += 1;
    }
  }
}
