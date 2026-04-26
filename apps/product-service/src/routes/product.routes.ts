import express, { Router } from 'express';
import { createDiscountCodes, deleteDiscountCode, getAllDiscountCodes, getCategories } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';


const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.delete('/delete-discount-code/:id', isAuthenticated, deleteDiscountCode);
router.get('/get-all-discount-codes', isAuthenticated, getAllDiscountCodes);

export default router;