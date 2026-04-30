const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const profileRoutes = require('./routes/profileRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

//middleware 
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', profileRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/category', categoryRoutes);
//Routes
app.get('/', (req, res) => {
    res.send("Product Management API is running....");
});

//Error handling middleware 

app.use((err, req, res, next) => {
    console.error("Global Error Caught:", err);

    // Check if it's a Prisma Unique Constraint error (e.g. duplicate category name)
    if (err.code === 'P2002') {
        return res.status(400).json({
            message: "This record already exists in the database."
        });
    }
    // Default error response for anything else
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message || "Something went wrong"
    });
});

module.exports = app;

