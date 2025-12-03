import NotificationService from "../services/NotificationService.js";

const notificationService = new NotificationService();

class NotificationController {
  static async getUserNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await notificationService.getUserNotifications(
        userId
      );
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  static async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await notificationService.markAsRead(id, userId);
      res.json({ message: "Notification marked as read" });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationService.markAllAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      next(err);
    }
  }
}

export default NotificationController;
