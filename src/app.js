const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const authRoutes=require('./routes/authRoutes');
const productRoutes=require('./routes/productRoutes');

//middleware 
app.use(cors());
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/products',productRoutes);
app.use('/uploads',express.static(path.join(__dirname,'../uploads')));
//Routes
app.get('/',(req,res)=>{
res.send("Product Management API is running....");
});

//Error handling middleware 

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({message:'Something went wrong!',error:err.message});
});

module.exports = app;

