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
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
        await prisma.session.create({
            data: {
                userId: user.id,
                token: token,
                refreshToken: refreshToken
            }
        });
        res.json({ message: 'Login successful', token, refreshToken });
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
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        //5 minutes
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        //update to database
        await prisma.user.update({
            where: { email },
            data: {
                resetOtp: otp,
                resetOtpExpiry: otpExpiry
            }
        });
        //send email with otp
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset your password',
            html: `
            <h1>Reset your password</h1>
            <p>Please use the OTP below to reset your password.</p>
            <p>OTP: <strong>${otp}</strong></p>
            <p>The OTP is valid for 5 minutes.</p>
            `
        });
        res.json({ message: 'An OTP has been sent to your registered email.' })

    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        // finduser
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        //check otp
        if (user.resetOtp !== otp) {
            return res.status(404).json({ message: 'Invalid OTP!' });
        }
        //check otp expiry
        if (user.resetOtpExpiry < new Date()) {
            return res.status(404).json({ message: 'OTP expired. Please request a new one!' });
        }
        //hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // 5. Update password and CLEAR the OTP so it can't be reused
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetOtp: null,
                resetOtpExpiry: null
            }
        });
        res.json({ message: 'Password reset successful!!' });
    } catch (error) {
        next(error);
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required!' })
        }

        const session = await prisma.session.findUnique({ where: { refreshToken: refreshToken } });
        if (!session) {
            return res.status(403).json({ message: 'Invalid refresh token!' });
        }
        //verify refresh token
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                await prisma.session.delete({ where: { refreshToken: refreshToken } });
                return res.status(403).json({ message: 'Refresh token expired. Please login again.' });
            }
            const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
            //update the session with new token
            await prisma.session.update({ where: { refreshToken: refreshToken }, data: { token: newToken } });
            res.json({ token: newToken });
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, logout, forgetPassword, resetPassword, refreshToken };