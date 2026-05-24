const { Router } = require('express');

const router = Router();

const adminUserController = require('../controllers/admin_user_controller');
const adminAuthMiddleware = require('../middelwares/admin-auth.middleware');
const adminRoleMiddleware = require('../middelwares/admin-role.middleware');

router.use(adminAuthMiddleware);
router.use(adminRoleMiddleware(['admin']));

router.get('/', adminUserController.getAll);
router.post('/', adminUserController.create);
router.patch('/:id', adminUserController.update);
router.delete('/:id', adminUserController.delete);

module.exports = router;