import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        
        console.log(name, description, price, category, subCategory, sizes, bestseller)
        console.log(image1, image2, image3, image4)

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        // Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { 
                    resource_type: "image",
                    folder: "products"
                })
                return result.secure_url
            })
        )

        // Save to database
        const product = new productModel({
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true",
            image: imagesUrl,
            date: Date.now()
        })
        
        await product.save()

        res.json({
            success: true,
            message: "Product Added Successfully",
            product
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
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
            message: error.message
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

        // Delete images from Cloudinary
        for (const url of product.image) {
            // Extract public_id from URL
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

        await productModel.findByIdAndDelete(id)

        res.json({
            success: true,
            message: "Product removed successfully"
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
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
            message: error.message
        })
    }
}

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

        // Handle new image uploads
        let newImageUrls = []
        
        const image1 = req.files?.image1 && req.files.image1[0]
        const image2 = req.files?.image2 && req.files.image2[0]
        const image3 = req.files?.image3 && req.files.image3[0]
        const image4 = req.files?.image4 && req.files.image4[0]

        const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined)

        if (newImages.length > 0) {
            newImageUrls = await Promise.all(
                newImages.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { 
                        resource_type: "image",
                        folder: "products"
                    })
                    return result.secure_url
                })
            )
        }

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
            message: error.message 
        })
    }
}

export { addProduct, listProduct, removeProduct, singleProduct, updateProduct }