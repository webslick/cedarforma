const bcrypt = require('bcrypt');

const { AdminUser } = require('../db/models');

class AdminUserService {
  async getAll() {
    return await AdminUser.findAll({
      attributes: {
        exclude: ['password'],
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data) {
    const { login, email, password, name, role } = data;

    if (!login) {
      const error = new Error('login обязателен');
      error.status = 400;
      throw error;
    }

    if (!password) {
      const error = new Error('password обязателен');
      error.status = 400;
      throw error;
    }

    const exists = await AdminUser.findOne({
      where: { login },
    });

    if (exists) {
      const error = new Error('Админ с таким login уже существует');
      error.status = 400;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 7);

    const admin = await AdminUser.create({
      login,
      email: email || null,
      password: hashPassword,
      name: name || null,
      role: role || 'manager',
      isActive: true,
    });

    const safeAdmin = admin.toJSON();
    delete safeAdmin.password;

    return safeAdmin;
  }

  async update(id, data) {
    const admin = await AdminUser.findByPk(id);

    if (!admin) {
      const error = new Error('Админ не найден');
      error.status = 404;
      throw error;
    }

    const payload = {
      login: data.login,
      email: data.email,
      name: data.name,
      role: data.role,
      isActive: data.isActive,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (data.password) {
      payload.password = await bcrypt.hash(data.password, 7);
    }

    await admin.update(payload);

    const safeAdmin = admin.toJSON();
    delete safeAdmin.password;

    return safeAdmin;
  }

  async delete(id, currentAdminId) {
    if (Number(id) === Number(currentAdminId)) {
      const error = new Error('Нельзя удалить самого себя');
      error.status = 400;
      throw error;
    }

    const admin = await AdminUser.findByPk(id);

    if (!admin) {
      const error = new Error('Админ не найден');
      error.status = 404;
      throw error;
    }

    await admin.destroy();

    return {
      message: 'Админ удалён',
    };
  }
}

module.exports = new AdminUserService();