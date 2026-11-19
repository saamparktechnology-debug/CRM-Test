const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const expenseController = require('../controllers/expenseController');
const { handleMultipartForm } = require('../middlewares/uploadMiddleware');

const expenseMultipart = handleMultipartForm({ file: 'receipt_url', receipt: 'receipt_url' });

router.use(authenticate);

router.get('/stats', expenseController.getStats);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getById);
router.post('/', expenseMultipart, expenseController.create);
router.put('/:id', expenseMultipart, expenseController.update);
router.patch('/:id/status', expenseController.updateStatus);
router.delete('/:id', expenseController.delete);

module.exports = router;
