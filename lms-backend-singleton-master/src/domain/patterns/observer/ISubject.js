export default class ISubject {
  attach(observer) {
    throw new Error("attach() must be implemented");
  }
  detach(observer) {
    throw new Error("detach() must be implemented");
  }
  notify(book, user) {
    throw new Error("notify() must be implemented");
  }
}

