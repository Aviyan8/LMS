import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { initDb } from "../db/index.js";
import BookRepository from "../repositories/BookRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import BorrowTransactionRepository from "../repositories/BorrowTransactionRepository.js";
import ReservationRepository from "../repositories/ReservationRepository.js";
import NotificationRepository from "../repositories/NotificationRepository.js";
import Book from "../domain/entities/Book.js";
import BorrowTransaction from "../domain/entities/BorrowTransaction.js";
import UserFactory from "../domain/patterns/factory/UserFactory.js";

dotenv.config();

// Helper function to add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper function to subtract days from a date
function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

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

// 5 Students
const students = [
  {
    name: "Alice Johnson",
    email: "alice@student.com",
    role: "STUDENT",
    password: "student123",
  },
  {
    name: "Bob Smith",
    email: "bob@student.com",
    role: "STUDENT",
    password: "student123",
  },
  {
    name: "Charlie Brown",
    email: "charlie@student.com",
    role: "STUDENT",
    password: "student123",
  },
  {
    name: "Diana Prince",
    email: "diana@student.com",
    role: "STUDENT",
    password: "student123",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@student.com",
    role: "STUDENT",
    password: "student123",
  },
];

// 2 Faculty
const faculty = [
  {
    name: "Dr. Sarah Williams",
    email: "sarah@faculty.com",
    role: "FACULTY",
    password: "faculty123",
  },
  {
    name: "Prof. Michael Chen",
    email: "michael@faculty.com",
    role: "FACULTY",
    password: "faculty123",
  },
];

// 1 Librarian
const librarian = {
  name: "Library Admin",
  email: "admin@library.com",
  role: "LIBRARIAN",
  password: "admin123",
};

async function seedAll() {
  try {
    console.log("Starting comprehensive database seeding...\n");

    // Initialize database
    await initDb();
    console.log("Database initialized\n");

    const bookRepository = new BookRepository();
    const userRepository = new UserRepository();
    const borrowTransactionRepository = new BorrowTransactionRepository();
    const reservationRepository = new ReservationRepository();
    const notificationRepository = new NotificationRepository();

    // ========== SEED BOOKS ==========
    console.log("Seeding books...");
    let booksSeeded = 0;
    const seededBooks = [];

    for (const bookData of popularBooks) {
      const existingBook = await bookRepository.findByIsbn(bookData.isbn);
      if (existingBook) {
        console.log(`Skipping "${bookData.title}" - already exists`);
        seededBooks.push(existingBook);
        continue;
      }

      const book = new Book({
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.availableCopies,
      });

      await bookRepository.save(book);
      seededBooks.push(book);
      booksSeeded++;
      console.log(`Seeded: "${bookData.title}"`);
    }
    console.log(`Books: ${booksSeeded} new, ${seededBooks.length} total\n`);

    // ========== SEED USERS ==========
    console.log("Seeding users...");

    // Seed Librarian
    let existingLibrarian = await userRepository.findByEmail(librarian.email);
    if (!existingLibrarian) {
      const passwordHash = await bcrypt.hash(librarian.password, 10);
      const librarianUser = UserFactory.createUser("LIBRARIAN", {
        name: librarian.name,
        email: librarian.email,
        passwordHash,
      });
      existingLibrarian = await userRepository.save(librarianUser);
      console.log(`Seeded Librarian: ${librarian.email}`);
    } else {
      console.log(`Librarian already exists: ${librarian.email}`);
    }

    // Seed Students
    const seededStudents = [];
    for (const studentData of students) {
      let existingStudent = await userRepository.findByEmail(studentData.email);
      if (!existingStudent) {
        const passwordHash = await bcrypt.hash(studentData.password, 10);
        const student = UserFactory.createUser("STUDENT", {
          name: studentData.name,
          email: studentData.email,
          passwordHash,
        });
        existingStudent = await userRepository.save(student);
        seededStudents.push(existingStudent);
        console.log(`Seeded Student: ${studentData.email}`);
      } else {
        console.log(`Student already exists: ${studentData.email}`);
        seededStudents.push(existingStudent);
      }
    }

    // Seed Faculty
    const seededFaculty = [];
    for (const facultyData of faculty) {
      let existingFaculty = await userRepository.findByEmail(facultyData.email);
      if (!existingFaculty) {
        const passwordHash = await bcrypt.hash(facultyData.password, 10);
        const facultyUser = UserFactory.createUser("FACULTY", {
          name: facultyData.name,
          email: facultyData.email,
          passwordHash,
        });
        existingFaculty = await userRepository.save(facultyUser);
        seededFaculty.push(existingFaculty);
        console.log(`Seeded Faculty: ${facultyData.email}`);
      } else {
        console.log(`Faculty already exists: ${facultyData.email}`);
        seededFaculty.push(existingFaculty);
      }
    }
    console.log(
      `Users: ${seededStudents.length} students, ${seededFaculty.length} faculty, 1 librarian\n`
    );

    // ========== SEED TRANSACTIONS ==========
    console.log("Seeding borrow transactions...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let transactionsSeeded = 0;

    // Get some books for transactions
    const booksForBorrowing = seededBooks.slice(0, 15); // Use first 15 books

    // 1. Active borrows (not overdue) - 5 transactions
    console.log("  Creating active borrows (not overdue)...");
    for (let i = 0; i < 5 && i < seededStudents.length; i++) {
      const student = seededStudents[i];
      const book = booksForBorrowing[i % booksForBorrowing.length];

      // Borrow date: 5-10 days ago
      const borrowDate = subtractDays(today, 5 + i);
      // Due date: 14 days from borrow date (so some are due soon, some have time)
      const dueDate = addDays(borrowDate, 14);

      // Update book availability
      if (book.availableCopies > 0) {
        book.availableCopies -= 1;
        await bookRepository.updateAvailability(book.id, book.availableCopies);
      }

      const transaction = new BorrowTransaction({
        user: student,
        book,
        borrowDate,
        dueDate,
        status: "BORROWED",
        paymentStatus: "PENDING",
      });

      await borrowTransactionRepository.save(transaction);
      transactionsSeeded++;
      console.log(
        `    ${student.name} borrowed "${
          book.title
        }" (Due: ${dueDate.toDateString()})`
      );
    }

    // 2. Overdue borrows (past due date, still borrowed) - 5 transactions
    console.log("  Creating overdue borrows (return due)...");
    for (let i = 0; i < 5 && i < seededStudents.length; i++) {
      const student = seededStudents[i];
      const book = booksForBorrowing[(i + 5) % booksForBorrowing.length];

      // Borrow date: 20-25 days ago
      const borrowDate = subtractDays(today, 20 + i);
      // Due date: 14 days from borrow date (so it's overdue by 6-11 days)
      const dueDate = addDays(borrowDate, 14);

      // Update book availability
      if (book.availableCopies > 0) {
        book.availableCopies -= 1;
        await bookRepository.updateAvailability(book.id, book.availableCopies);
      }

      const transaction = new BorrowTransaction({
        user: student,
        book,
        borrowDate,
        dueDate,
        status: "BORROWED",
        paymentStatus: "PENDING",
      });

      await borrowTransactionRepository.save(transaction);
      transactionsSeeded++;
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      console.log(
        `    ${student.name} borrowed "${book.title}" (Overdue by ${daysOverdue} days)`
      );
    }

    // 3. Returned books with fees (some paid, some unpaid) - 8 transactions
    console.log("  Creating returned books with fees...");
    for (
      let i = 0;
      i < 8 && i < seededStudents.length + seededFaculty.length;
      i++
    ) {
      const user =
        i < seededStudents.length
          ? seededStudents[i]
          : seededFaculty[i - seededStudents.length];
      const book = booksForBorrowing[(i + 10) % booksForBorrowing.length];

      // Borrow date: 30-40 days ago
      const borrowDate = subtractDays(today, 30 + i);
      // Due date: 14 days from borrow date
      const dueDate = addDays(borrowDate, 14);
      // Return date: 2-5 days after due date (so there are late fees)
      const returnDate = addDays(dueDate, 2 + (i % 4));

      // Calculate fees (late fee: $5 per overdue return)
      const daysOverdue = Math.ceil(
        (returnDate - dueDate) / (1000 * 60 * 60 * 24)
      );
      const lateFee = daysOverdue > 0 ? 5 : 0;
      const totalFee = lateFee;

      // Some are paid, some are unpaid
      const isPaid = i % 2 === 0;
      const paymentStatus = isPaid ? "PAID" : "PENDING";
      const paidAt = isPaid ? returnDate : null;

      const transaction = new BorrowTransaction({
        user,
        book,
        borrowDate,
        dueDate,
        returnDate,
        status: "RETURNED",
        baseFee: 0,
        lateFee,
        reservationFee: 0,
        paymentStatus,
        paidAt,
      });

      await borrowTransactionRepository.save(transaction);
      transactionsSeeded++;
      console.log(
        `    ${user.name} returned "${book.title}" (Fee: $${totalFee.toFixed(
          2
        )}, Status: ${paymentStatus})`
      );
    }

    console.log(`Transactions: ${transactionsSeeded} created\n`);

    // ========== SEED RESERVATIONS ==========
    console.log("Seeding reservations...");
    let reservationsSeeded = 0;

    // Get some books that are currently unavailable (borrowed)
    const unavailableBooks = seededBooks.filter(
      (book) => book.availableCopies === 0
    );

    // Create reservations for unavailable books
    if (unavailableBooks.length > 0) {
      for (let i = 0; i < Math.min(6, unavailableBooks.length); i++) {
        const book = unavailableBooks[i];
        const user =
          seededStudents[i % seededStudents.length] ||
          seededFaculty[i % seededFaculty.length];

        // Check if reservation already exists
        const existingReservations = await reservationRepository.findByUserId(
          user.id
        );
        const existingReservation = existingReservations.find(
          (r) => r.bookId === book.id && r.status === "PENDING"
        );

        if (!existingReservation) {
          await reservationRepository.create(user.id, book.id);
          reservationsSeeded++;
          console.log(`  ${user.name} reserved "${book.title}"`);
        }
      }
    }

    // // Also create some reservations for available books (to simulate future scenarios)
    // const availableBooks = seededBooks.filter(
    //   (book) => book.availableCopies > 0
    // );
    // if (availableBooks.length > 0) {
    //   for (let i = 0; i < Math.min(3, availableBooks.length); i++) {
    //     const book = availableBooks[i];
    //     const user =
    //       seededStudents[(i + 3) % seededStudents.length] ||
    //       seededFaculty[(i + 3) % seededFaculty.length];

    //     const existingReservations = await reservationRepository.findByUserId(
    //       user.id
    //     );
    //     const existingReservation = existingReservations.find(
    //       (r) => r.bookId === book.id && r.status === "PENDING"
    //     );

    //     if (!existingReservation) {
    //       await reservationRepository.create(user.id, book.id);
    //       reservationsSeeded++;
    //       console.log(`  ${user.name} reserved "${book.title}"`);
    //     }
    //   }
    // }

    console.log(`Reservations: ${reservationsSeeded} created\n`);

    // ========== SEED NOTIFICATIONS ==========
    console.log("Seeding notifications...");
    let notificationsSeeded = 0;

    // Get all pending reservations
    const allReservations = [];
    for (const user of [...seededStudents, ...seededFaculty]) {
      const userReservations = await reservationRepository.findByUserId(
        user.id
      );
      allReservations.push(
        ...userReservations.filter((r) => r.status === "PENDING")
      );
    }

    // Create notifications for some reservations (simulating books that became available)
    for (let i = 0; i < Math.min(5, allReservations.length); i++) {
      const reservation = allReservations[i];
      // Reservation from repository includes Book association
      const book =
        reservation.Book ||
        seededBooks.find((b) => b.id === reservation.bookId);

      if (book) {
        const bookTitle = book.title || "Unknown Book";
        const message = `Book "${bookTitle}" is now available for you.`;
        await notificationRepository.create(reservation.userId, message);
        notificationsSeeded++;
        console.log(`  Notification created for user: "${message}"`);
      }
    }

    // Create some read notifications
    for (let i = 0; i < Math.min(3, allReservations.length - 5); i++) {
      const reservation = allReservations[i + 5];
      if (reservation) {
        const book =
          reservation.Book ||
          seededBooks.find((b) => b.id === reservation.bookId);
        if (book) {
          const bookTitle = book.title || "Unknown Book";
          const notification = await notificationRepository.create(
            reservation.userId,
            `Book "${bookTitle}" was available (read notification).`
          );
          // Mark as read
          await notificationRepository.markAsRead(
            notification.id,
            reservation.userId
          );
          notificationsSeeded++;
          console.log(`  Read notification created for user`);
        }
      }
    }

    console.log(`Notifications: ${notificationsSeeded} created\n`);

    // ========== SUMMARY ==========
    console.log("=".repeat(50));
    console.log("Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("\nSummary:");
    console.log(`  Books: ${seededBooks.length} total`);
    console.log(
      `  Users: ${seededStudents.length} students, ${seededFaculty.length} faculty, 1 librarian`
    );
    console.log(`  Transactions: ${transactionsSeeded} created`);
    console.log(`  Reservations: ${reservationsSeeded} created`);
    console.log(`  Notifications: ${notificationsSeeded} created`);
    console.log("\nLogin Credentials:");
    console.log("  Librarian:");
    console.log(`    Email: ${librarian.email}`);
    console.log(`    Password: ${librarian.password}`);
    console.log("\n  Students (all use password: student123):");
    students.forEach((s) => console.log(`    - ${s.email}`));
    console.log("\n  Faculty (all use password: faculty123):");
    faculty.forEach((f) => console.log(`    - ${f.email}`));
    console.log("\nTransaction Types Created:");
    console.log("  5 Active borrows (not overdue)");
    console.log("  5 Overdue borrows (return due)");
    console.log("  8 Returned books with fees (4 paid, 4 unpaid)");
    console.log("\nReservation & Notification Data:");
    console.log(`  ${reservationsSeeded} reservations created`);
    console.log(
      `  ${notificationsSeeded} notifications created (some marked as read)`
    );
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedAll();
