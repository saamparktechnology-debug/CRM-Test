const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { branchController, subBranchController } = require('../controllers/branchController');
const { handleMultipartForm, upload } = require('../middlewares/uploadMiddleware');

const branchMultipart = handleMultipartForm({
  logo: 'logo_url',
  signature: 'signature_image_url',
  stamp: 'stamp_image_url',
  qr: 'payment_qr_url',
  gst_qr: 'gst_payment_qr_url',
  nongst_qr: 'nongst_payment_qr_url',
  file: 'logo_url',
});

router.use(authenticate);

// Sub-branch routes FIRST (before parameterized /:id)
router.get('/sub-branches/all', subBranchController.getAll);
router.get('/sub-branches/:id', subBranchController.getById);
router.post('/sub-branches', branchMultipart, subBranchController.create);
router.put('/sub-branches/:id', branchMultipart, subBranchController.update);
router.delete('/sub-branches/:id', requireRole(1), subBranchController.delete);

// Branch routes
router.get('/stats', branchController.getStats);
router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);
router.post('/', branchMultipart, branchController.create);
router.put('/:id', branchMultipart, branchController.update);
router.post('/:id/assets', upload.any(), branchController.uploadAsset);
router.delete('/:id', requireRole(1), branchController.delete);

module.exports = router;
