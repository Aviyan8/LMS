import User from "./User.js";

export default class FacultyUser extends User {
  constructor(props) {
    super({ ...props, role: "FACULTY", maxBorrowLimit: 5 });
  }
}
