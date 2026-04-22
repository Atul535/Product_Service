const express = require('express');
const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productControllers');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

//get all products (public)
router.get('/', getAllProducts);

//create new product (private)
router.post('/', authMiddleware, upload.single('image'), createProduct);

//update product (private)
router.put('/:id', authMiddleware, updateProduct);

//delete product (private)
router.delete('/:id', authMiddleware, deleteProduct)

module.exports = router;