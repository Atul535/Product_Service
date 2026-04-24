const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const authMiddleware = async (req, res, next) => {
  // Get token from the 'Authorization' header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Expected format: Bearer YOUR_TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // checking session in database
    const activeSession = await prisma.session.findUnique({ where: { token: token } });
    if (!activeSession) {
      return res.status(401).json({ message: 'Session Expired! Please login again.' });
    }
    req.user = decoded; // Attach user data to the request object
    next(); // Move to the next function (the controller)
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
