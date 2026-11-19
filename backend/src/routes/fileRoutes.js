const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/fileController');

router.post('/upload', authenticate, upload.any(), uploadSingleFile);
router.post('/upload-multiple', authenticate, upload.any(), uploadMultipleFiles);

module.exports = router;
