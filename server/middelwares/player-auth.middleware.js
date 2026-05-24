const jwt = require('jsonwebtoken');

module.exports = function playerAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен не найден',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'player') {
      return res.status(403).json({
        success: false,
        message: 'Неверный тип токена',
      });
    }

    req.player = decoded;

    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: 'Ошибка авторизации',
    });
  }
};