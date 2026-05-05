const express = require('express');
const { createProduct, getAllProducts, updateProduct, deleteProduct, searchProducts } = require('../controllers/productControllers');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createProductRules, updateProductRules, validate } = require('../middleware/validationMiddleware');
const router = express.Router();

router.get('/search', searchProducts);
//get all products (public)
router.get('/', getAllProducts);

//create new product (private)
router.post('/', authMiddleware, upload.single('image'), createProductRules, validate, createProduct);

//update product (private)
router.put('/:id', authMiddleware, upload.single('image'), updateProductRules, validate, updateProduct);


//delete product (private)
router.delete('/:id', authMiddleware, deleteProduct)

module.exports = router;