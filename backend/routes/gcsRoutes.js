const express = require('express');
const router = express.Router();
const { getUploadSignedUrl, getDownloadSignedUrl } = require('../controllers/gcsController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/upload-url', protect, getUploadSignedUrl);
router.get('/download-url', protect, getDownloadSignedUrl);

module.exports = router;
