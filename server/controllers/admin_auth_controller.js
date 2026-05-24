const adminAuthService = require('../services/admin-auth-service');

class AdminAuthController {
  async login(req, res) {
    try {
      const data = await adminAuthService.login(req.body);

      return res.json({
        success: true,
        message: 'Вход в админку выполнен',
        data,
      });
    } catch (e) {
      return res.status(e.status || 400).json({
        success: false,
        message: e.message,
      });
    }
  }

  async me(req, res) {
    try {
      const admin = await adminAuthService.me(req.admin.id);

      return res.json({
        success: true,
        data: admin,
      });
    } catch (e) {
      return res.status(e.status || 400).json({
        success: false,
        message: e.message,
      });
    }
  }
}

module.exports = new AdminAuthController();