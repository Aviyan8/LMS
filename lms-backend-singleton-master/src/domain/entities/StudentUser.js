import User from "./User.js";

export default class StudentUser extends User {
  constructor(props) {
    super({ ...props, role: "STUDENT", maxBorrowLimit: 3 });
  }
}
