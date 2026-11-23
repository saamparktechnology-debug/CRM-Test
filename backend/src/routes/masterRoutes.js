const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// Public/authenticated read endpoints for all CRM dropdowns
router.use(authenticate);

router.get('/bundle', masterController.getBundle);
router.get('/types', masterController.getTypes);
router.get('/options/:typeCode', masterController.getOptionsByType);

// Super Admin (role_id = 1) only mutations
router.post('/types', requireRole(1), masterController.createType);
router.put('/types/:id', requireRole(1), masterController.updateType);

router.post('/options', requireRole(1), masterController.createOption);
router.put('/options/:id', requireRole(1), masterController.updateOption);
router.patch('/options/reorder', requireRole(1), masterController.reorderOptions);
router.delete('/options/:id', requireRole(1), masterController.deleteOption);

module.exports = router;
