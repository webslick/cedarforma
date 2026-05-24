const adminUserService = require('../services/admin-user-service');

class AdminUserController {
  async getAll(req, res) {
    try {
      const admins = await adminUserService.getAll();

      return res.json({
        success: true,
        data: admins,
      });
    } catch (e) {
      return res.status(e.status || 500).json({
        success: false,
        message: e.message,
      });
    }
  }

  async create(req, res) {
    try {
      const admin = await adminUserService.create(req.body);

      return res.status(201).json({
        success: true,
        message: 'Админ создан',
        data: admin,
      });
    } catch (e) {
      return res.status(e.status || 400).json({
        success: false,
        message: e.message,
      });
    }
  }

  async update(req, res) {
    try {
      const admin = await adminUserService.update(req.params.id, req.body);

      return res.json({
        success: true,
        message: 'Админ обновлён',
        data: admin,
      });
    } catch (e) {
      return res.status(e.status || 400).json({
        success: false,
        message: e.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const result = await adminUserService.delete(req.params.id, req.admin.id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (e) {
      return res.status(e.status || 400).json({
        success: false,
        message: e.message,
      });
    }
  }
}

module.exports = new AdminUserController();