import { getSequelize } from "../db/index.js";
import { Op } from "sequelize";

export default class ReservationRepository {
  constructor() {
    // Don't access models in constructor - they're not initialized yet
  }

  get sequelize() {
    return getSequelize();
  }

  get ReservationModel() {
    return this.sequelize.models.Reservation;
  }

  async findById(id) {
    const row = await this.ReservationModel.findByPk(id, {
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
    });
    return row ? row.toJSON() : null;
  }

  async findByBookId(bookId) {
    const rows = await this.ReservationModel.findAll({
      where: {
        bookId,
        status: {
          [Op.in]: ["PENDING", "NOTIFIED"], // Include both PENDING and NOTIFIED
        },
      },
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
      order: [["id", "ASC"]], // FIFO order
    });
    return rows.map((r) => r.toJSON());
  }

  async getNextPending(bookId) {
    const row = await this.ReservationModel.findOne({
      where: { bookId, status: "PENDING" },
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
      order: [["id", "ASC"]],
    });
    return row ? row.toJSON() : null;
  }

  async findByUserId(userId) {
    const rows = await this.ReservationModel.findAll({
      where: { userId },
      include: [
        { model: this.sequelize.models.User },
        { model: this.sequelize.models.Book },
      ],
    });
    return rows.map((r) => r.toJSON());
  }

  async create(userId, bookId) {
    const created = await this.ReservationModel.create({
      userId,
      bookId,
      status: "PENDING",
    });
    return created.toJSON();
  }

  async updateStatus(id, status) {
    await this.ReservationModel.update({ status }, { where: { id } });
  }

  async delete(id) {
    await this.ReservationModel.destroy({ where: { id } });
  }
}
