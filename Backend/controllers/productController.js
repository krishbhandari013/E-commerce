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
export {addProduct,listProduct,removeProduct,singleProduct}