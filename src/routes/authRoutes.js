const express = require('express');
const { register, login, getProfile, getAllUsers } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/getAllUsers', authMiddleware, getAllUsers);

module.exports = router;
