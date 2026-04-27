const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma');
const nodemailer = require('nodemailer');

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        //check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user 
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({ message: 'User registered successfully', userID: user.id });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // find user
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }

        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials!' });
        }
        //generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        await prisma.session.create({
            data: {
                userId: user.id,
                token: token
            }
        });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        //delete token from database
        await prisma.session.delete({
            where: { token: token }
        });
        res.json({ message: 'Logout successful and session cleared' });
    } catch (error) {
        res.status(400).json({ message: 'Logout failed or already logged out' });
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '15m' });
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const link = `${baseUrl}/api/auth/reset-password/${user.id}/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password reset request!',
            html: `
            <h1>Password Reset</h1>
            <p>Click on the link to reset your password:</p>
            <a href="${link}">Reset Password</a>
            <p>This link will expire in 15 minutes</p>
            `
        });
        res.json({ message: 'Reset link sent to your email' });

    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        const secret = process.env.JWT_SECRET + user.password;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({ message: 'Link is invalid or expired!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: parseInt(id) }, data: { password: hashedPassword } });
        res.json({ message: 'Password reset successful!!' });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, logout, forgetPassword, resetPassword };