const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryControllers');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/createCategory', authMiddleware, upload.single('image'), createCategory);
router.get('/getAllCategories', authMiddleware, getAllCategories);
router.put('/updateCategory/:id', authMiddleware, upload.single('image'), updateCategory);
router.delete('/deleteCategory/:id', authMiddleware, deleteCategory);

module.exports = router;