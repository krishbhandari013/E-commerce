import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PRODUCTS_DIR = path.join(__dirname, '..', 'uploads', 'products')
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`

// Local dev has dummy Cloudinary keys -> store uploads on disk (served via /uploads).
const useLocalStorage = !process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_NAME === 'dummy'

const extFromMimetype = (mimetype, originalname) => {
  if (mimetype === 'image/jpeg') return 'jpg'
  if (mimetype === 'image/png') return 'png'
  if (mimetype === 'image/webp') return 'webp'
  if (mimetype === 'image/gif') return 'gif'
  return (originalname?.split('.').pop() || 'jpg').toLowerCase().slice(0, 4)
}

const saveFilesLocally = async (files) => {
  await fs.mkdir(PRODUCTS_DIR, { recursive: true })
  const urls = []
  for (const file of files) {
    // Unguessable random filename (no timestamps/sequences to enumerate)
    const fname = `${crypto.randomBytes(16).toString('hex')}.${extFromMimetype(file.mimetype, file.originalname)}`
    await fs.writeFile(path.join(PRODUCTS_DIR, fname), file.buffer)
    urls.push(`${BASE_URL}/uploads/products/${fname}`)
  }
  return urls
}

const uploadToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString('base64')
  const dataURI = `data:${file.mimetype};base64,${b64}`
  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'image',
    folder: 'products'
  })
  return result.secure_url
}

// Upload image buffers, returning public URLs (local disk or Cloudinary).
const uploadImages = async (files) => {
  if (useLocalStorage) return saveFilesLocally(files)
  return Promise.all(files.map(uploadToCloudinary))
}

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body

    // Get files from memory (not disk)
    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    const images = [image1, image2, image3, image4].filter(item => item !== undefined)

    // Upload images (local disk in dev, Cloudinary when real keys are configured)
    let imagesUrl = await uploadImages(images)

    // Save to database
    const product = new productModel({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === 'true',
      image: imagesUrl,
      date: Date.now()
    })

    await product.save()

    res.json({
      success: true,
      message: 'Product added successfully',
      product
    })
  } catch (error) {
    console.error('Error adding product:', error)
    res.status(500).json({ success: false, message: 'Could not add product. Please try again.' })
  }
}

const listProduct = async (req, res) => {
    try {
        const products = await productModel
            .find({})
            .sort({ date: -1 })

        res.json({
            success: true,
            count: products.length,
            products
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Could not fetch products. Please try again.'
        })
    }
}

const removeProduct = async (req, res) => {
    try {
        const { id } = req.body

        const product = await productModel.findById(id)

        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }

        // Delete images (local files or Cloudinary) — best effort, never fail the removal
        for (const url of product.image) {
            try {
                if (url.includes('/uploads/products/')) {
                    const fname = url.split('/').pop()
                    await fs.unlink(path.join(PRODUCTS_DIR, fname))
                } else {
                    // Extract public_id from Cloudinary URL
                    // URL format: https://res.cloudinary.com/.../image/upload/v12345/products/public_id.jpg
                    const urlParts = url.split('/')
                    const publicIdWithExtension = urlParts[urlParts.length - 1]
                    const publicId = publicIdWithExtension.split('.')[0]

                    // Get folder name (if exists)
                    const folderIndex = urlParts.indexOf('upload')
                    if (folderIndex !== -1 && urlParts[folderIndex + 2]) {
                        const folder = urlParts[folderIndex + 1]
                        const fullPublicId = `${folder}/${publicId}`
                        await cloudinary.uploader.destroy(fullPublicId)
                    } else {
                        await cloudinary.uploader.destroy(publicId)
                    }
                }
            } catch (e) {
                console.log('Image cleanup skipped:', e.message)
            }
        }

        await productModel.findByIdAndDelete(id)

        res.json({
            success: true,
            message: "Product removed successfully"
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Could not remove product. Please try again.'
        })
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body

        const product = await productModel.findById(productId)

        res.json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: 'Could not fetch product. Please try again.'
        })
    }
}

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    
    console.log("Update Request - Body:", req.body)
    console.log("Update Request - Files:", req.files)

    // Get data from form
    const { 
      name, 
      description, 
      category, 
      subCategory, 
      price, 
      sizes, 
      bestseller,
      existingImages 
    } = req.body

    // Validate required fields
    if (!name || !description || !category || !subCategory || !price) {
      return res.json({ 
        success: false, 
        message: "Missing required fields" 
      })
    }

    // Parse sizes (comes as JSON string)
    let parsedSizes = []
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes)
      } catch (error) {
        parsedSizes = []
      }
    }

    // Parse existing images
    let existingImageUrls = []
    if (existingImages) {
      try {
        existingImageUrls = JSON.parse(existingImages)
      } catch (error) {
        existingImageUrls = []
      }
    }

    // =============================================
    // 🔴 THIS IS WHERE YOU ADD THE NEW CODE 🔴
    // Handle new image uploads from memory
    // =============================================
    let newImageUrls = []
    
    // Helper function to upload a single file (local disk in dev, Cloudinary otherwise)
    const uploadSingle = async (file) => {
      const urls = await uploadImages([file])
      console.log(`✅ Uploaded: ${urls[0]}`)
      return urls[0]
    }

    // Check for new images in request
    if (req.files) {
      const uploadPromises = []
      
      // Check each possible image field
      if (req.files.image1 && req.files.image1[0]) {
        uploadPromises.push(uploadSingle(req.files.image1[0]))
      }
      if (req.files.image2 && req.files.image2[0]) {
        uploadPromises.push(uploadSingle(req.files.image2[0]))
      }
      if (req.files.image3 && req.files.image3[0]) {
        uploadPromises.push(uploadSingle(req.files.image3[0]))
      }
      if (req.files.image4 && req.files.image4[0]) {
        uploadPromises.push(uploadSingle(req.files.image4[0]))
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        newImageUrls = await Promise.all(uploadPromises)
        console.log(`✅ Uploaded ${newImageUrls.length} new images`)
      }
    }
    // =============================================
    // 🔴 END OF NEW CODE 🔴
    // =============================================

    // Combine existing and new images
    const allImages = [...existingImageUrls, ...newImageUrls]

    // Update product in database
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        subCategory,
        price: Number(price),
        sizes: parsedSizes,
        bestseller: bestseller === 'true' || bestseller === true,
        image: allImages
      },
      { new: true }
    )

    if (!updatedProduct) {
      return res.json({ 
        success: false, 
        message: "Product not found" 
      })
    }

    res.json({ 
      success: true, 
      message: "Product updated successfully",
      product: updatedProduct 
    })

  } catch (error) {
    console.error("Error updating product:", error)
    res.json({
      success: false,
      message: 'Could not update product. Please try again.'
    })
  }
}

export { addProduct, listProduct, removeProduct, singleProduct, updateProduct }