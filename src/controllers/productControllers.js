const prisma = require('../utils/prisma');

//create a new product
const createProduct = async (req, res, next) => {
    try {
        const { name, price, quantity, manufacturedDate, categoryId } = req.body;
        // get the image path if a file is uploaded
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        //basic validation
        if (!name || !price || !quantity || !manufacturedDate) {
            return res.status(400).json({ message: 'All fields required!' });
        }

        const product = await prisma.$transaction(async (tx) => {
            return await tx.product.create({
                data: {
                    name,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    manufacturedDate: new Date(manufacturedDate),
                    imageUrl,
                    categoryId: categoryId ? parseInt(categoryId) : null
                },
            });
        });
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        next(error);
    }
};

//get all products(with soft-delete check)
const getAllProducts = async (req, res, next) => {
    try {
        const { name, page = 1, limit = 10, minPrice, maxPrice, categoryId } = req.query;
        const skip = (page - 1) * limit;

        const where = {
            isDeleted: false,
            ...(name && { name: { contains: name } }),
            ...(categoryId && { categoryId: parseInt(categoryId) }),
            ...(minPrice || maxPrice) && {
                price: {
                    ...(minPrice && { gte: Number(minPrice) }),
                    ...(maxPrice && { lte: Number(maxPrice) })
                }
            }
        }
        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: { category: true }
            }),
            prisma.product.count({ where })
        ]);
        res.json({
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
            data: products
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, manufacturedDate, categoryId } = req.body;

        const product = await prisma.$transaction(
            async (tx) => {
                //check existing product 
                const existing = await tx.product.findUnique({ where: { id: parseInt(id) } });
                if (!existing || existing.isDeleted) {
                    throw new Error('Product not found!');
                }
                return await tx.product.update({
                    where: { id: parseInt(id) },
                    data: {
                        ...(name && { name }),
                        ...(price && { price: parseFloat(price) }),
                        ...(quantity && { quantity: parseInt(quantity) }),
                        ...(manufacturedDate && { manufacturedDate: new Date(manufacturedDate) }),
                        ...(categoryId && { categoryId: parseInt(categoryId) })
                    }
                });
            });
        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(404).json({ message: "Product not found!" });
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.product.update({
            where: { id: parseInt(id) },
            data: { isDeleted: true }
        });
        res.json({ message: "Product deleted (soft delete) successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct, getAllProducts, updateProduct, deleteProduct
};
