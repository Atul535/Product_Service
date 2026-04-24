const express = require('express');
const { getProfile, getAllUsers } = require('../controllers/profileControllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/getUser', authMiddleware, getProfile);
router.get('/getAllUsers', authMiddleware, getAllUsers);

module.exports = router;
