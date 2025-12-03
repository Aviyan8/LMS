import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default (sequelize) => {
  const BorrowTransaction = sequelize.define("BorrowTransaction", {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    borrowDate: { type: DataTypes.DATE, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    returnDate: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM("BORROWED", "RETURNED", "OVERDUE"),
      defaultValue: "BORROWED",
    },
    baseFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    lateFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    reservationFee: { type: DataTypes.FLOAT, defaultValue: 0 },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED"),
      defaultValue: "PENDING",
    },
    paymentId: { type: DataTypes.STRING, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  });

  return BorrowTransaction;
};
