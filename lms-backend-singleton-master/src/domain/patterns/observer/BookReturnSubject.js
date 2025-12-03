import ISubject from "./ISubject.js";

export default class BookReturnSubject extends ISubject {
  constructor() {
    super();
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async notify(book, user) {
    await Promise.all(
      this.observers.map((o) => Promise.resolve(o.update(book, user)))
    );
  }
}

