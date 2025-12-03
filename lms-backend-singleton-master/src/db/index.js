import { Sequelize } from "sequelize";
import { dbConfig } from "../config/db.config.js";
import BookModel from "../models/BookModel.js";
import UserModel from "../models/UserModel.js";
import BorrowTransactionModel from "../models/BorrowTransactionModel.js";
import ReservationModel from "../models/ReservationModel.js";
import NotificationModel from "../models/NotificationModel.js";

let sequelize;

export const initDb = async () => {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: false,
    }
  );

  // Init models
  const User = UserModel(sequelize);
  const Book = BookModel(sequelize);
  const BorrowTransaction = BorrowTransactionModel(sequelize);
  const Reservation = ReservationModel(sequelize);
  const Notification = NotificationModel(sequelize);

  // Associations
  User.hasMany(BorrowTransaction, { foreignKey: "userId" });
  BorrowTransaction.belongsTo(User, { foreignKey: "userId" });

  Book.hasMany(BorrowTransaction, { foreignKey: "bookId" });
  BorrowTransaction.belongsTo(Book, { foreignKey: "bookId" });

  User.hasMany(Reservation, { foreignKey: "userId" });
  Reservation.belongsTo(User, { foreignKey: "userId" });

  Book.hasMany(Reservation, { foreignKey: "bookId" });
  Reservation.belongsTo(Book, { foreignKey: "bookId" });

  User.hasMany(Notification, { foreignKey: "userId" });
  Notification.belongsTo(User, { foreignKey: "userId" });

  // Use alter: true to modify existing tables, or force: true to drop and recreate
  // For UUID migration, we need to drop and recreate tables
  // Set FORCE_SYNC=true in .env to force recreate (drops all data)
  // Note: Using alter can cause "Too many keys" error with MySQL's 64 key limit
  // So we disable alter and only use force sync when needed
  const forceSync = process.env.FORCE_SYNC === "true";

  if (forceSync) {
    await sequelize.sync({ force: true });
    console.log("Database synced (tables recreated)");
  } else {
    // For alter mode, we need to be careful with foreign keys
    // Drop Notifications table first to avoid constraint issues
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await sequelize.query("DROP TABLE IF EXISTS `Notifications`");
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (error) {
      // Ignore if table doesn't exist
    }

    // Sync without alter to avoid "too many keys" error
    // Tables will be created if they don't exist, but won't be altered
    await sequelize.sync({ alter: false });
    console.log("Database synced");
  }
};

export const getSequelize = () => sequelize;
