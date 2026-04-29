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

const updateProfile = async (req, res, next) => {
    try {
        const { name, oldPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!!!' });
        }

        const updateData = {};
        if (name) {
            updateData.name = name;
        }
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password!' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData, select: { id: true, name: true, email: true, } });
        res.json({ message: 'Profile updated successfully!!' })
    } catch (error) {
        next(error);
    }
}

module.exports = { getProfile, getAllUsers, updateProfile };