const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma');

const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true, } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!!' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}
const getAllUsers = async (req, res, next) => {
    try {
        const user = await prisma.user.findMany({ select: { id: true, name: true, email: true, } });
        res.json(user);
    } catch (error) {
        next(error);
    }
}

module.exports = { getProfile, getAllUsers };