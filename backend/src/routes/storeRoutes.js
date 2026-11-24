const express = require('express');
const router = express.Router();
const {
  getStoreData,
  saveStoreData,
  getPublicProducts,
  getPublicStorefront,
  createPublicOrder,
  getPublicOrder,
} = require('../controllers/storeController');

// Public endpoints for Ecommerce-web storefront integration
router.get('/public/products', getPublicProducts);
router.get('/public/storefront', getPublicStorefront);
router.post('/public/orders', createPublicOrder);
router.get('/public/orders/:orderNumber', getPublicOrder);

// Standard CRM module data endpoints
router.get('/:key', getStoreData);
router.post('/:key', saveStoreData);
router.put('/:key', saveStoreData);

module.exports = router;
