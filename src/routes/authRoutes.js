const express = require('express');
const { register, login, logout, forgetPassword, resetPassword, refreshToken } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-Token',refreshToken);
module.exports = router;
