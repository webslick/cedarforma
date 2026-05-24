const { Router } = require('express');

const router = Router();

const adminAuthController = require('../controllers/admin_auth_controller');
const adminAuthMiddleware = require('../middelwares/admin-auth.middleware');

router.post('/login', adminAuthController.login);
router.get('/me', adminAuthMiddleware, adminAuthController.me);

module.exports = router;