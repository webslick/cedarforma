const { Router } = require('express');
const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CedarForma API работает' });
});

module.exports = router;
