import { getSequelize } from "../db/index.js";
import { Op } from "sequelize";
import Book from "../domain/entities/Book.js";

export default class BookRepository {
  constructor() {
    // Don't access models in constructor - they're not initialized yet
  }

  get sequelize() {
    return getSequelize();
  }

  get BookModel() {
    return this.sequelize.models.Book;
  }

  async findById(id) {
    const row = await this.BookModel.findByPk(id);
    if (!row) return null;
    return new Book(row.toJSON());
  }

  async findByTitle(title) {
    const rows = await this.BookModel.findAll({
      where: { title },
    });
    return rows.map((r) => new Book(r.toJSON()));
  }

  async findAll() {
    const rows = await this.BookModel.findAll({
      order: [["title", "ASC"]],
    });
    return rows.map((r) => new Book(r.toJSON()));
  }

  async search(query) {
    const rows = await this.BookModel.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { isbn: { [Op.like]: `%${query}%` } },
        ],
      },
      order: [["title", "ASC"]],
    });
    return rows.map((r) => new Book(r.toJSON()));
  }

  async findByIsbn(isbn) {
    const row = await this.BookModel.findOne({ where: { isbn } });
    if (!row) return null;
    return new Book(row.toJSON());
  }

  async save(book) {
    if (!book.id) {
      const created = await this.BookModel.create({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
      });
      book.id = created.id;
      return book;
    } else {
      await this.BookModel.update(
        {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
        },
        { where: { id: book.id } }
      );
      return book;
    }
  }

  async updateAvailability(bookId, availableCopies) {
    await this.BookModel.update({ availableCopies }, { where: { id: bookId } });
  }

  async delete(bookId) {
    await this.BookModel.destroy({ where: { id: bookId } });
  }
}
