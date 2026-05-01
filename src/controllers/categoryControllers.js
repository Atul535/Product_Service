const { PrismaClient } = require('@prisma/client');
const { product } = require('../utils/prisma');
const prisma = new PrismaClient();

const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const category = await prisma.category.create({
            data: { name, description, imageUrl },
        });
        res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (error) {
        next(error);
    }
}

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: true,
            }
        });
        res.status(200).json({ message: 'Categories fetched!!', data: categories });
    } catch (error) {
        next(error);
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const dataToUpdate = {
            ...(name && { name }),
            ...(description && { description }),
            ...(imageUrl && { imageUrl }),
        };
        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        res.status(200).json({ message: 'Category Updated', data: category });
    } catch (error) {
        next(error);
    }
}

const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Category deleted successfully!!" })

    } catch (error) {
        next(error);
    }
}

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };