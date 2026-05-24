module.exports = (err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Непредвиденная ошибка',
  });
};
