const express = require('express');
const { getProfile, getAllUsers, updateProfile } = require('../controllers/profileControllers');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/getUser', authMiddleware, getProfile);
router.get('/getAllUsers', authMiddleware, getAllUsers);
router.put('/updateProfile', authMiddleware, updateProfile);

module.exports = router;
