const { Router } = require('express');
const router = Router();

const leadController = require('../controllers/lead_controller');
const adminAuthMiddleware = require('../middelwares/admin-auth.middleware');
const leadRateLimit = require('../middelwares/lead-rate-limit.middleware');
const { leadPhotosUpload } = require('../middlewares/upload.middleware');

router.post(
  '/',
  leadRateLimit,
  leadPhotosUpload.array('photos', 8),
  leadController.createLead
);
router.get('/', adminAuthMiddleware, leadController.getAllLeads);
router.get('/:id/events', adminAuthMiddleware, leadController.getLeadEvents);
router.patch('/:id', adminAuthMiddleware, leadController.updateLead);
router.patch('/:id/status', adminAuthMiddleware, leadController.updateLeadStatus);
router.delete('/:id', adminAuthMiddleware, leadController.deleteLead);

module.exports = router;
