import express from 'express'
import { addProduct, listProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRoute = express.Router();

productRoute.post('/add', adminAuth, upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 }
]), addProduct);

productRoute.post('/remove', adminAuth, removeProduct);
productRoute.get('/list', listProduct);
productRoute.post('/single', singleProduct);

// IMPORTANT: Add multer middleware to update route too
productRoute.put('/update/:id', adminAuth, upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 }
]), updateProduct);

export default productRoute;