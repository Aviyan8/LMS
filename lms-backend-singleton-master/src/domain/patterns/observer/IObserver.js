// interface-like: observer must implement update(book, user)
export default class IObserver {
  update(book, user) {
    throw new Error("update() must be implemented");
  }
}

