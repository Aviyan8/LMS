import User from "./User.js";

export default class Librarian extends User {
  constructor(props) {
    super({ ...props, role: "LIBRARIAN", maxBorrowLimit: 10 });
  }
}
