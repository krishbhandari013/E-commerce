import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'

const Add = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: "",
    sizes: [],
    bestseller: false
  })

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })
  
  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showSuccess, setShowSuccess] = useState(false)

  const categories = ["Men", "Women", "Kids"]
  const subCategories = ["Topwear", "Bottomwear", "Winterwear"]
  const sizeOptions = ["S", "M", "L", "XL", "XXL"]

  const getToken = () => {
    const token = localStorage.getItem('adminToken')
    console.log("Token from localStorage:", token) // Debug
    return token
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0]
    console.log(`Image ${imageKey} selected:`, file) // Debug
    if (file) {
      setImages(prev => ({
        ...prev,
        [imageKey]: file
      }))
      
      const previewUrl = URL.createObjectURL(file)
      setPreviewImages(prev => ({
        ...prev,
        [imageKey]: previewUrl
      }))
    }
  }

  const removeImage = (imageKey) => {
    setImages(prev => ({
      ...prev,
      [imageKey]: null
    }))
    setPreviewImages(prev => ({
      ...prev,
      [imageKey]: null
    }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Validation
  if (!images.image1) {
    setMessage({ text: "Please upload at least one image", type: "error" })
    return
  }

  if (formData.sizes.length === 0) {
    setMessage({ text: "Please select at least one size", type: "error" })
    return
  }

  const token = localStorage.getItem('adminToken')
  console.log("Token from localStorage:", token) // Debug
  
  if (!token) {
    setMessage({ text: "No token found. Please login again.", type: "error" })
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
    return
  }

  setLoading(true)
  setMessage({ text: "", type: "" })

  try {
    const formDataToSend = new FormData()
    
    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('category', formData.category)
    formDataToSend.append('subCategory', formData.subCategory)
    formDataToSend.append('price', formData.price)
    formDataToSend.append('sizes', JSON.stringify(formData.sizes))
    formDataToSend.append('bestseller', formData.bestseller)
    
    if (images.image1) formDataToSend.append('image1', images.image1)
    if (images.image2) formDataToSend.append('image2', images.image2)
    if (images.image3) formDataToSend.append('image3', images.image3)
    if (images.image4) formDataToSend.append('image4', images.image4)

    // Log the token being sent
    console.log("Sending token:", `Bearer ${token}`)

    const response = await axios.post('http://localhost:5000/api/product/add', formDataToSend, {
      headers: {
       
         'token': token // Make sure this format is correct
      }
    })

    console.log("Response:", response.data)

    if (response.data.success) {
      setMessage({ text: "✅ Product added successfully!", type: "success" })
      setShowSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: "",
          description: "",
          category: "",
          subCategory: "",
          price: "",
          sizes: [],
          bestseller: false
        })
        setImages({
          image1: null,
          image2: null,
          image3: null,
          image4: null
        })
        setPreviewImages({
          image1: null,
          image2: null,
          image3: null,
          image4: null
        })
        setMessage({ text: "", type: "" })
        setShowSuccess(false)
      }, 3000)
    }
  } catch (error) {
    console.error("Error:", error)
    
    if (error.response?.status === 401) {
      setMessage({ text: "Session expired. Please login again.", type: "error" })
      localStorage.removeItem('adminToken')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } else {
      setMessage({ 
        text: error.response?.data?.message || "Error adding product", 
        type: "error" 
      })
    }
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black">Add New Product</h1>
        <div className="w-16 h-0.5 bg-black mt-2"></div>
      </div>

      {showSuccess && (
        <div className="fixed top-20 right-5 z-50 animate-slideIn">
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Product added successfully!</span>
          </div>
        </div>
      )}

      {message.text && !showSuccess && (
        <div className={`mb-6 p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-black mb-4">PRODUCT IMAGES</h2>
          <p className="text-xs text-gray-400 mb-4">Upload up to 4 images</p>
          
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => {
              const imageKey = `image${num}`
              return (
                <div key={imageKey} className="relative group">
                  {previewImages[imageKey] ? (
                    <div className="aspect-square border border-gray-200 overflow-hidden bg-gray-50">
                      <img 
                        src={previewImages[imageKey]} 
                        alt={`Product ${num}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(imageKey)}
                        className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                      {num === 1 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] py-0.5 text-center">
                          COVER
                        </span>
                      )}
                    </div>
                  ) : (
                    <label className="aspect-square border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, imageKey)}
                        className="hidden"
                        disabled={loading}
                      />
                      <img 
                        src={assets.add_icon} 
                        alt="Add" 
                        className="w-8 h-8 opacity-40 mb-1"
                      />
                      <span className="text-xs text-gray-400">Image {num}</span>
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Basic Information */}
        <div className="border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-black mb-4">BASIC INFORMATION</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">PRODUCT NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Cotton T-Shirt"
                className="w-full px-3 py-2 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">DESCRIPTION</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Product description..."
                className="w-full px-3 py-2 border border-gray-200 text-black text-sm focus:outline-none focus:border-black resize-none"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Category & Sub Category */}
        <div className="border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-black mb-4">CATEGORY</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">CATEGORY</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
                required
                disabled={loading}
              >
                <option value="">Select</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">SUB CATEGORY</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
                required
                disabled={loading}
              >
                <option value="">Select</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price & Size */}
        <div className="border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-black mb-4">PRICE & SIZE</h2>
          
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs text-gray-500 mb-1">PRICE ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">AVAILABLE SIZES</label>
              <div className="flex flex-wrap gap-4">
                {sizeOptions.map(size => (
                  <label key={size} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleSizeChange(size)}
                      className="w-3.5 h-3.5 border-gray-300"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Best Seller Option */}
        <div className="border border-gray-200 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="bestseller"
              checked={formData.bestseller}
              onChange={handleInputChange}
              className="w-4 h-4 border-gray-300"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">Mark as Best Seller</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 bg-black text-white text-sm transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            {loading ? 'ADDING...' : 'ADD PRODUCT'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                description: "",
                category: "",
                subCatagory: "",
                price: "",
                sizes: [],
                bestseller: false
              })
              setImages({
                image1: null,
                image2: null,
                image3: null,
                image4: null
              })
              setPreviewImages({
                image1: null,
                image2: null,
                image3: null,
                image4: null
              })
              setMessage({ text: "", type: "" })
            }}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            CLEAR
          </button>
        </div>
      </form>
    </div>
  )
}

export default Add