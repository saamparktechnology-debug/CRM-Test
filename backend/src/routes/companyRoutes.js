const express = require('express');
const router = express.Router();
const {
  getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany, getCompanyMembers, uploadCompanyAsset
} = require('../controllers/companyController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { handleMultipartForm, upload } = require('../middlewares/uploadMiddleware');

const companyMultipart = handleMultipartForm({
  logo: 'logo_url',
  signature: 'signature_image_url',
  stamp: 'stamp_image_url',
  qr: 'payment_qr_url',
  gst_qr: 'gst_payment_qr_url',
  nongst_qr: 'nongst_payment_qr_url',
  file: 'logo_url',
});

// All require authentication
router.get('/', authenticate, getAllCompanies);
router.get('/:id', authenticate, getCompanyById);
router.get('/:id/members', authenticate, requireRole(1, 2), getCompanyMembers);

// Super Admin can create/delete companies; Admin/Super Admin can update & upload assets
router.post('/', authenticate, requireRole(1), companyMultipart, createCompany);
router.put('/:id', authenticate, requireRole(1, 2), companyMultipart, updateCompany);
router.post('/:id/assets', authenticate, requireRole(1, 2), upload.any(), uploadCompanyAsset);
router.delete('/:id', authenticate, requireRole(1), deleteCompany);

module.exports = router;
