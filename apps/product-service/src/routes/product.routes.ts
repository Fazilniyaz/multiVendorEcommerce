import express, { Router } from 'express';
import { createDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllDiscountCodes, getAllProducts, getCategories, getSHopProducts, restoreProduct, uploadProductImage } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';


const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.get('/get-all-discount-codes', isAuthenticated, getAllDiscountCodes);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);
router.post('/create-product', isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getSHopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
// router.get("/get-stripe-account" , isAuthenticated, isSeller,  getStr
router.get("/get-all-products", getAllProducts);

export default router;