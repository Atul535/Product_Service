const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const createProductRules = [
    body('name').notEmpty().withMessage('Name is required!'),
    body('price').notEmpty().withMessage('Price is required!'),
    body('quantity').notEmpty().withMessage('Quantity is required!'),
    body('manufacturedDate').notEmpty().withMessage('Manufactured date is required!'),
    body('categoryId').optional().isNumeric().withMessage('Category ID must be a number!'),
];

const updateProductRules = [
    body('name').optional().notEmpty().withMessage('Name is required!'),
    body('price').optional().notEmpty().withMessage('Price is required!'),
    body('quantity').optional().notEmpty().withMessage('Quantity is required!'),
    body('manufacturedDate').optional().notEmpty().withMessage('Manufactured date is required!'),
    body('categoryId').optional().isNumeric().withMessage('Category ID must be a number!'),
];

module.exports = { validate, createProductRules, updateProductRules };