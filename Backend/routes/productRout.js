import express from 'express'
import upload from '../middleware/multer.js'
import { addProduct, listProduct, removeProduct, singleProduct, updateProduct } from '../controllers/productController.js'
import adminAuth from '../middleware/adminAuth.js'

const productRoute = express.Router()

// Use upload.fields() for multiple images
productRoute.post(
  '/add', 
  adminAuth, 
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
  ]), 
  addProduct
)

productRoute.get('/list', listProduct)
productRoute.post('/remove', adminAuth, removeProduct)
productRoute.post('/single', singleProduct)
productRoute.put('/:id', adminAuth, upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]), updateProduct)

export default productRoute