import IObserver from "../IObserver.js";

export default class LibrarianObserver extends IObserver {
  update(book, user) {
    console.log(
      `Librarian notified: ${user.name} returned book "${book.title}"`
    );
  }
}

