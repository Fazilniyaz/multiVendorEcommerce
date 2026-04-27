import express, { Router } from 'express';
import { createDiscountCodes, deleteDiscountCode, deleteProductImage, getAllDiscountCodes, getCategories, uploadProductImage } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';


const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.get('/get-all-discount-codes', isAuthenticated, getAllDiscountCodes);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);

export default router;