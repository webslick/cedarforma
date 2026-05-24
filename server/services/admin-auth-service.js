const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { AdminUser } = require('../db/models');

class AdminAuthService {
  generateToken(admin) {
    return jwt.sign(
      {
        id: admin.id,
        login: admin.login,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async login(data) {
    const { login, password } = data;

    if (!login || !password) {
      const error = new Error('login и password обязательны');
      error.status = 400;
      throw error;
    }

    const admin = await AdminUser.findOne({
      where: { login },
    });

    if (!admin) {
      const error = new Error('Неверный логин или пароль');
      error.status = 401;
      throw error;
    }

    if (!admin.isActive) {
      const error = new Error('Администратор отключён');
      error.status = 403;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      const error = new Error('Неверный логин или пароль');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(admin);

    const safeAdmin = admin.toJSON();
    delete safeAdmin.password;

    return {
      token,
      admin: safeAdmin,
    };
  }

  async me(adminId) {
    const admin = await AdminUser.findByPk(adminId, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!admin) {
      const error = new Error('Администратор не найден');
      error.status = 404;
      throw error;
    }

    return admin;
  }
}

module.exports = new AdminAuthService();