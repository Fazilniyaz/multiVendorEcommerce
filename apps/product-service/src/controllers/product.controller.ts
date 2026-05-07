import { Request, Response, NextFunction } from "express";
import prisma from "@multi-vendor-ecommerce/prisma";
import { NotFoundError, ValidationError } from "@packages/error-handler";
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