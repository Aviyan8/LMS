import { getSequelize } from "../db/index.js";

// Notification repository
export default class NotificationRepository {
  constructor() {}

  get sequelize() {
    return getSequelize();
  }

  get NotificationModel() {
    return this.sequelize.models.Notification;
  }

  async create(userId, message) {
    const created = await this.NotificationModel.create({
      userId,
      message,
      isRead: false,
    });
    return created.toJSON();
  }

  async findByUserId(userId) {
    const rows = await this.NotificationModel.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    return rows.map((n) => n.toJSON());
  }

  async getUnreadCount(userId) {
    const count = await this.NotificationModel.count({
      where: { userId, isRead: false },
    });
    return count;
  }

  async markAsRead(notificationId, userId) {
    await this.NotificationModel.update(
      { isRead: true },
      { where: { id: notificationId, userId } }
    );
  }

  async markAllAsRead(userId) {
    await this.NotificationModel.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }
}
