import { getSequelize } from "../db/index.js";
import UserFactory from "../domain/patterns/factory/UserFactory.js";

export default class UserRepository {
  constructor() {
    // Don't access models in constructor - they're not initialized yet
  }

  get sequelize() {
    return getSequelize();
  }

  get UserModel() {
    return this.sequelize.models.User;
  }

  async findById(id) {
    const row = await this.UserModel.findByPk(id);
    if (!row) return null;
    return UserFactory.createUser(row.role, row.toJSON());
  }

  async findByEmail(email) {
    const row = await this.UserModel.findOne({ where: { email } });
    if (!row) return null;
    return UserFactory.createUser(row.role, row.toJSON());
  }

  async save(user) {
    if (!user.id) {
      const created = await this.UserModel.create({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        maxBorrowLimit: user.maxBorrowLimit,
      });
      user.id = created.id;
      return user;
    } else {
      await this.UserModel.update(
        {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          maxBorrowLimit: user.maxBorrowLimit,
        },
        { where: { id: user.id } }
      );
      return user;
    }
  }

  async findAll() {
    const rows = await this.UserModel.findAll();
    return rows.map((row) => UserFactory.createUser(row.role, row.toJSON()));
  }

  async delete(userId) {
    await this.UserModel.destroy({ where: { id: userId } });
  }

  async getBorrowedCount(userId) {
    const count = await this.sequelize.models.BorrowTransaction.count({
      where: {
        userId,
        status: "BORROWED",
      },
    });
    return count;
  }
}

