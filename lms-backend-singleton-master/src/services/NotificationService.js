import logger from "../utils/logger.js";
import NotificationRepository from "../repositories/NotificationRepository.js";

export default class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async notifyUser(userId, message) {
    // Store notification in database
    await this.notificationRepository.create(userId, message);
    logger.info(`Notification to user ${userId}: ${message}`);
    // In a real app, this would also send email/push notification
  }

  async getUserNotifications(userId) {
    return await this.notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId) {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId, userId) {
    await this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
