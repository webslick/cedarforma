const hits = new Map();

module.exports = function leadRateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxHits = 5;

  const current = (hits.get(ip) || []).filter((time) => now - time < windowMs);

  if (current.length >= maxHits) {
    return res.status(429).json({
      success: false,
      message: 'Слишком много заявок. Попробуйте чуть позже.',
    });
  }

  current.push(now);
  hits.set(ip, current);
  next();
};
