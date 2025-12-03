import StudentUser from "../../entities/StudentUser.js";
import FacultyUser from "../../entities/FacultyUser.js";
import Librarian from "../../entities/Librarian.js";

class UserFactory {
  static createUser(role, props) {
    switch (role) {
      case "STUDENT":
        return new StudentUser(props);
      case "FACULTY":
        return new FacultyUser(props);
      case "LIBRARIAN":
        return new Librarian(props);
      default:
        throw new Error("Unknown user role: " + role);
    }
  }
}

export default UserFactory;

