import {v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'

const addProduct = async (req,res) =>{
    try{

        const {name , description , price,category,subCategory,sizes,bestseller} = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        console.log(name , description , price,category,subCategory,sizes,bestseller)
        console.log(image1,image2,image3,image4)

        const images = [image1,image2,image3,image4].filter((item) => item !== undefined)

        // 🔹 Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async(item)=>{ 
                let result = await cloudinary.uploader.upload(item.path,{resource_type:"image"})
                return result.secure_url
            })
        )

        // ✅ 🔥 PUT YOUR DATABASE SAVE CODE HERE
      const product = new productModel({
    name,
    description,
    price:Number(price),
    category,
    subCategory,  // match schema spelling
    sizes: JSON.parse(sizes),
    bestseller: bestseller === "true" ,
    image: imagesUrl,          // match schema name
    date: Date.now()
})
        await product.save()

        // 🔹 send response after saving
        res.json({
            success: true,
            message: "Product Added Successfully",
            product
        })

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



const listProduct = async (req, res) => {
    try {

        const products = await productModel
            .find({})
            .sort({ date: -1 }) // latest first

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

        // delete images
        for (const url of product.image) {
            const public_id = url.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(public_id)
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
// In your product controller
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Update Request - Body:", req.body);
    console.log("Update Request - Files:", req.files);

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
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !subCategory || !price) {
      return res.json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    // Parse sizes (comes as JSON string)
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (error) {
        parsedSizes = [];
      }
    }

    // Parse existing images
    let existingImageUrls = [];
    if (existingImages) {
      try {
        existingImageUrls = JSON.parse(existingImages);
      } catch (error) {
        existingImageUrls = [];
      }
    }

    // Handle new image uploads
    let newImageUrls = [];
    if (req.files) {
      const uploadPromises = [];
      
      if (req.files.image1) {
        uploadPromises.push(
          cloudinary.uploader.upload(req.files.image1[0].path, { resource_type: "image" })
        );
      }
      if (req.files.image2) {
        uploadPromises.push(
          cloudinary.uploader.upload(req.files.image2[0].path, { resource_type: "image" })
        );
      }
      if (req.files.image3) {
        uploadPromises.push(
          cloudinary.uploader.upload(req.files.image3[0].path, { resource_type: "image" })
        );
      }
      if (req.files.image4) {
        uploadPromises.push(
          cloudinary.uploader.upload(req.files.image4[0].path, { resource_type: "image" })
        );
      }

      if (uploadPromises.length > 0) {
        const uploadedImages = await Promise.all(uploadPromises);
        newImageUrls = uploadedImages.map(img => img.secure_url);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImageUrls, ...newImageUrls];

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
    );

    if (!updatedProduct) {
      return res.json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Product updated successfully",
      product: updatedProduct 
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};
export {addProduct,listProduct,removeProduct,singleProduct,updateProduct}