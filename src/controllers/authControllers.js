const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const prisma = require('../utils/prisma');

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
        const token = req.headers.authorization.split('')[1];
        //delete token from database
        await prisma.session.delete({
            where: { token: token }
        });
        res.json({ message: 'Logout successful and session cleared' });
    } catch (error) {
        res.status(400).json({ message: 'Logout failed or already logged out' });
    }
}

module.exports = { register, login, logout };