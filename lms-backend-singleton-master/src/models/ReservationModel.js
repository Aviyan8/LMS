import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default (sequelize) => {
  const Reservation = sequelize.define("Reservation", {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "NOTIFIED", "CANCELLED"),
      defaultValue: "PENDING",
    },
  });

  return Reservation;
};
