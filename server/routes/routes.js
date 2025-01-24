const express = require('express');
const router = express.Router();
const { getSearchResult, uploadImage } = require('../controller/controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/api', uploadImage);
router.post('/upload', getSearchResult);
module.exports = router;
