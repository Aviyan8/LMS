import UserService from "../services/UserService.js";

const userService = new UserService();

class UserController {
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async getBorrowedCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await userService.getUserBorrowedCount(userId);
      res.json({ count });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, email, password } = req.body;
      
      // Only allow updating name, email, and password
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (password !== undefined) updateData.password = password;

      const updatedUser = await userService.updateSelf(userId, updateData);
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Old password and new password are required" });
      }

      const updatedUser = await userService.changePassword(userId, oldPassword, newPassword);
      res.json({ message: "Password changed successfully", user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;

