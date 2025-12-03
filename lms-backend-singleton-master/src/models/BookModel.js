import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default (sequelize) => {
  const Book = sequelize.define("Book", {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    isbn: { type: DataTypes.STRING, allowNull: false, unique: true },
    totalCopies: { type: DataTypes.INTEGER, defaultValue: 1 },
    availableCopies: { type: DataTypes.INTEGER, defaultValue: 1 },
  });

  return Book;
};
