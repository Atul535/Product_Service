const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryControllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/createCategory', authMiddleware, createCategory);
router.get('/getAllCategories', authMiddleware, getAllCategories);
router.put('/updateCategory/:id', authMiddleware, updateCategory);
router.delete('/deleteCategory/:id', authMiddleware, deleteCategory);

module.exports = router;