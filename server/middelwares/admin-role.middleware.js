module.exports = function adminRoleMiddleware(roles = []) {
  return function (req, res, next) {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Администратор не авторизован',
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав',
      });
    }

    next();
  };
};