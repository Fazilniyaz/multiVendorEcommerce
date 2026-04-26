import { Request, Response, NextFunction } from "express";
import prisma from "@multi-vendor-ecommerce/prisma";


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