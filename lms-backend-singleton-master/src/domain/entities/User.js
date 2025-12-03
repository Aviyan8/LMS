export default class User {
  constructor({ id, name, email, role, maxBorrowLimit, passwordHash }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.maxBorrowLimit = maxBorrowLimit;
    this.passwordHash = passwordHash;
  }

  canBorrow(currentBorrowedCount) {
    return currentBorrowedCount < this.maxBorrowLimit;
  }

  getRole() {
    return this.role;
  }
}
