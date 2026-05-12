import { Request, Response, NextFunction } from "express";
import prisma from "@multi-vendor-ecommerce/prisma";
import { AuthenticationError, NotFoundError, ValidationError } from "@packages/error-handler";
import ImageKit from "@packages/libs/imageKit";


//get product categroies
export const getCategories = async (req: Request, res: Response) => {
    try {
        const config = await prisma.site_config.findFirst()

        if (!config) {
            return res.status(404).json({ success: false, message: 'Categories not found' });
        }

        return res.status(200).json({ success: true, categories: config.categories, subCategories: config.subCategories });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//Create discount codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    console.log("Creating discount code API hit")
    try {
        const { publicName, discountType, discountValue, discountCode, sellerId } = req.body;

        const isDiscountCodesExist = await prisma.discount_codes.findUnique({
            where: {
                discountCode,
            },
        });

        if (isDiscountCodesExist) {
            return next(
                new ValidationError("Discount code already exists", { statusCode: 400 })
            )
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                publicName,
                discountType,
                discountValue,
                discountCode,
                sellerId: req.seller.id
            },
        });

        return res.status(200).json({ success: true, discount_code });
    } catch (error) {
        next(error)
    }
}

//Delete Discount codes
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const sellerId = req?.seller.id;

        const discountCode = await prisma.discount_codes.findUnique({
            where: { id }, select: { id: true, sellerId: true }
        })

        if (!discountCode) {
            return next(
                new NotFoundError("Discount code not found")
            )
        }

        if (discountCode.sellerId !== sellerId) {
            return next(
                new ValidationError("You are not authorized to delete this discount code")
            )
        }

        await prisma.discount_codes.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({ success: true, message: "Discount code deleted successfully" });
    } catch (error) {
        next(error)
    }
}

//Get All Discount codes
export const getAllDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req?.seller.id;

        const discountCodes = await prisma.discount_codes.findMany({
            where: {
                sellerId,
            },
        });

        return res.status(200).json({ success: true, discountCodes });
    } catch (error) {
        next(error)
    }
}

//upload product image
export const uploadProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;

        const result = await ImageKit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
        })

        return res.status(200).json({ success: true, file_url: result.url, fileId: result.fileId });
    } catch (error) {
        next(error)
    }
}

//Delete product image
export const deleteProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;
        const result = await ImageKit.deleteFile(fileId);
        if (result) {
            return res.status(200).json({ success: true, message: "Product image deleted successfully" });
        }
        return next(new Error("Failed to delete product image"));
    } catch (error) {
        next(error)
    }
}

//Create Product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title, short_description, detailed_description, warranty,
            custom_specifications, slug, tags, cash_on_delivery, brand,
            video_url, category, colors = [], sizes = [],
            discountCodes = [], stock, sale_price, regular_price,
            subCategory, customProperties = {}, images = []
        } = req.body;

        // Validate only truly required fields (matching Prisma schema)
        let missedField = ""

        if (!title) {
            missedField = "title";
        } else if (!short_description) {
            missedField = "short_description";
        } else if (!detailed_description) {
            missedField = "detailed_description";
        } else if (!slug) {
            missedField = "slug";
        } else if (!category) {
            missedField = "category";
        } else if (!subCategory) {
            missedField = "subCategory";
        } else if (!stock) {
            missedField = "stock";
        } else if (!sale_price) {
            missedField = "sale_price";
        } else if (!regular_price) {
            missedField = "regular_price";
        } else if (!images.length) {
            missedField = "images";
        }

        if (missedField) {
            return next(
                new ValidationError(`The field '${missedField}' is required`)
            )
        }

        if (!req.seller?.id) {
            return next(
                new AuthenticationError("Only Seller can create products")
            )
        }

        const shopId = req.seller?.shop?.id;
        if (!shopId) {
            return next(
                new ValidationError("Seller must have a shop to create products")
            )
        }

        const slugChecking = await prisma.products.findUnique({
            where: {
                slug,
            }
        })

        if (slugChecking) {
            return next(
                new ValidationError("Slug already exists! Please use Different slug!")
            )
        }

        // Parse tags: handle both string (comma-separated) and array formats
        const parsedTags = Array.isArray(tags)
            ? tags
            : (tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []);

        const newProduct = await prisma.products.create({
            data: {
                title,
                description: detailed_description,
                short_description,
                detailed_description,
                warranty: warranty || null,
                custom_specifications: custom_specifications || {},
                slug,
                tags: parsedTags,
                cash_on_delivery: cash_on_delivery || null,
                brand: brand || null,
                video_url: video_url || null,
                category,
                colors: colors || [],
                sizes: sizes || [],
                discount_codes: discountCodes.map((code: string) => code),
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price),
                regular_price: parseFloat(regular_price),
                subCategory,
                customProperties: customProperties || {},
                images: {
                    create: images.filter((img: any) => img && img.fileId && img.file_url).map((img: any) => ({
                        file_id: img.fileId,
                        url: img.file_url,
                    }))
                },
                sellerId: req.seller.id,
                shop: {
                    connect: {
                        id: shopId,
                    }
                }
            },
            include: {
                images: true,
            }
        });

        return res.status(200).json({
            success: true,
            product: newProduct
        })

    } catch (error) {
        next(error)
    }
}


//get logged in seller products
export const getSHopProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const products = await prisma.products.findMany({
            where: {
                shopId : req.seller?.shop?.id,
            }, include: {
                images: true,
            }
        });
        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        next(error)
    }
}

//delete product 
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {
                id: productId
            },
            select: {
                id: true,
                shopId: true,
                isDeleted: true,
                deletedAt: true,
            }
        });

        if (!product) { 
            return next(
                new NotFoundError("Product not found")
            )
        }

        if (product.shopId !== sellerId) {
            return next(
                new AuthenticationError("You are not authorized to delete this product")
            )
        }

        if (product.isDeleted) {
            return next(
                new ValidationError("Product is already in deleted state")
            )
        }

        const deletedProduct = await prisma.products.update({
            where: {
                id: productId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Schedule permanent deletion after 24 hours,
            }
        });

        return res.status(200).json({ success: true, message: "Product is scheduled for deletion in 24 hours. You can restore it within this time.",deletedAt: deletedProduct.deletedAt });
    }
    catch (error) {
        next(error)
    }
}

//restore product
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const sellerId = req.seller?.shop?.id;

        const product = await prisma.products.findUnique({
            where: {
                id: productId
            },
            select: {
                id: true,
                shopId: true,
                isDeleted: true,
                deletedAt: true,
            }
        });

        if (!product) {
            return next(
                new NotFoundError("Product not found")
            )
        }

        if (product.shopId !== sellerId) {
            return next(
                new AuthenticationError("You are not authorized to restore this product")
            )
        }

        if (!product.isDeleted) {
            return next(
                new ValidationError("Product is not in deleted state")
            )
        }   

        await prisma.products.update({
            where: {
                id: productId
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            }
        });

        return res.status(200).json({ success: true, message: "Product restored successfully" });
    }      
    catch (error) {
        next(error)
    }
}