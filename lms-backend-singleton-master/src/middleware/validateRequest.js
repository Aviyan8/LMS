export function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!["STUDENT", "FACULTY"].includes(role)) {
    return res.status(403).json({
      error:
        "Cannot register as LIBRARIAN. Only librarians can create librarian accounts.",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  next();
}

export function validateBook(req, res, next) {
  const { title, author, isbn } = req.body;

  if (!title || !author || !isbn) {
    return res
      .status(400)
      .json({ error: "Title, author, and ISBN are required" });
  }

  next();
}

export function validateCreateUser(req, res, next) {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role) {
    return res
      .status(400)
      .json({ error: "Name, email, and role are required" });
  }

  if (!["STUDENT", "FACULTY", "LIBRARIAN"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (password && password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  next();
}

export function validateUpdateUserRole(req, res, next) {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role is required" });
  }

  if (!["STUDENT", "FACULTY", "LIBRARIAN"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  next();
}
