const express = require('express');
const router = express.Router();
const {
  getStoreData,
  saveStoreData,
  getPublicProducts,
  getPublicStorefront,
  getPublicCatalogAndStorefront,
  createPublicOrder,
  getPublicOrder,
  requestClientEmailOtp,
  clientEmailLogin,
  getClientOrdersByEmail,
} = require('../controllers/storeController');

// Public endpoints for Ecommerce-web storefront integration
router.get('/public/products', getPublicProducts);
router.get('/public/storefront', getPublicStorefront);
router.get('/public/catalog', getPublicCatalogAndStorefront);
router.post('/public/orders', createPublicOrder);
router.get('/public/orders/:orderNumber', getPublicOrder);
router.post('/public/client-otp', requestClientEmailOtp);
router.post('/public/client-login', clientEmailLogin);
router.get('/public/client-orders', getClientOrdersByEmail);

// Standard CRM module data endpoints
router.get('/:key', getStoreData);
router.post('/:key', saveStoreData);
router.put('/:key', saveStoreData);

module.exports = router;
