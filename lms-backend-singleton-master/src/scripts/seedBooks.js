import dotenv from "dotenv";
import { initDb } from "../db/index.js";
import BookRepository from "../repositories/BookRepository.js";
import Book from "../domain/entities/Book.js";

dotenv.config();

// 30 Popular Books
const popularBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "978-0316769488",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "Lord of the Flies",
    author: "William Golding",
    isbn: "978-0571056866",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    totalCopies: 7,
    availableCopies: 7,
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "978-0544003415",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "978-0747532699",
    totalCopies: 8,
    availableCopies: 8,
  },
  {
    title: "The Chronicles of Narnia",
    author: "C.S. Lewis",
    isbn: "978-0064471190",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    isbn: "978-0452284241",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    isbn: "978-0060850524",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    isbn: "978-0141439570",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    isbn: "978-0486282114",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    isbn: "978-0486411095",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    isbn: "978-0141441146",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    isbn: "978-0141439556",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Moby-Dick",
    author: "Herman Melville",
    isbn: "978-0142437247",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    isbn: "978-0142437179",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "The Adventures of Tom Sawyer",
    author: "Mark Twain",
    isbn: "978-0143039563",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "The Scarlet Letter",
    author: "Nathaniel Hawthorne",
    isbn: "978-0142437261",
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: "The Grapes of Wrath",
    author: "John Steinbeck",
    isbn: "978-0143039433",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Of Mice and Men",
    author: "John Steinbeck",
    isbn: "978-0140177398",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: "The Old Man and the Sea",
    author: "Ernest Hemingway",
    isbn: "978-0684801223",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "The Sun Also Rises",
    author: "Ernest Hemingway",
    isbn: "978-0743297332",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    isbn: "978-1451673319",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    isbn: "978-0385490818",
    totalCopies: 6,
    availableCopies: 6,
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    isbn: "978-1594631931",
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    isbn: "978-0375831003",
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "978-0061122415",
    totalCopies: 7,
    availableCopies: 7,
  },
];

async function seedBooks() {
  try {
    // Initialize database
    await initDb();
    console.log("Database initialized");

    const bookRepository = new BookRepository();

    let seededCount = 0;
    let skippedCount = 0;

    for (const bookData of popularBooks) {
      // Check if book with this ISBN already exists
      const existingBook = await bookRepository.findByIsbn(bookData.isbn);
      if (existingBook) {
        console.log(`⏭️  Skipping "${bookData.title}" - ISBN already exists`);
        skippedCount++;
        continue;
      }

      // Create domain book
      const book = new Book({
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.availableCopies,
      });

      // Save to database
      await bookRepository.save(book);
      seededCount++;
      console.log(`✅ Seeded: "${bookData.title}" by ${bookData.author}`);
    }

    console.log("\n📚 Book seeding completed!");
    console.log(`✅ Successfully seeded: ${seededCount} books`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} books`);
    console.log(`📖 Total books in database: ${seededCount + skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding books:", error);
    process.exit(1);
  }
}

seedBooks();
