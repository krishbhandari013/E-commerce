import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import toast from 'react-hot-toast'

const List = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editImages, setEditImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })
  const [editPreviewImages, setEditPreviewImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/product/list')
      if (response.data.success) {
        setProducts(response.data.products)
      } else {
        toast.error(response.data.message || "Failed to load products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (productId) => {
    // Custom toast confirmation
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <p className="text-sm font-medium text-black">Delete Product</p>
        </div>
        <p className="text-xs text-gray-500">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              confirmDelete(productId)
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
          >
            DELETE
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }
    })
  }

  const confirmDelete = async (productId) => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error("Please login again")
      setTimeout(() => window.location.href = '/login', 2000)
      return
    }

    const toastId = toast.loading('Deleting product...')

    try {
      const response = await axios.post('http://localhost:5000/api/product/remove', 
        { id: productId },
        { headers: { 'token': token } }
      )

      if (response.data.success) {
        toast.success("Product removed successfully", { id: toastId })
        setProducts(products.filter(p => p._id !== productId))
      } else {
        toast.error(response.data.message || "Failed to delete product", { id: toastId })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.", { id: toastId })
        localStorage.removeItem('adminToken')
        setTimeout(() => window.location.href = '/login', 2000)
      } else {
        toast.error(error.response?.data?.message || "Error deleting product", { id: toastId })
      }
    }
  }

  const handleEdit = (product) => {
    setEditingProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      price: product.price,
      sizes: product.sizes || [],
      bestseller: product.bestseller || false,
      existingImages: product.image || []
    })
    
    setEditImages({
      image1: null,
      image2: null,
      image3: null,
      image4: null
    })
    setEditPreviewImages({
      image1: null,
      image2: null,
      image3: null,
      image4: null
    })
    
    setShowEditModal(true)
  }

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditingProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditSizeChange = (size) => {
    setEditingProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const handleEditImageChange = (e, imageKey) => {
    const file = e.target.files[0]
    if (file) {
      setEditImages(prev => ({
        ...prev,
        [imageKey]: file
      }))
      
      const previewUrl = URL.createObjectURL(file)
      setEditPreviewImages(prev => ({
        ...prev,
        [imageKey]: previewUrl
      }))
    }
  }

  const removeEditImage = (imageKey) => {
    setEditImages(prev => ({
      ...prev,
      [imageKey]: null
    }))
    setEditPreviewImages(prev => ({
      ...prev,
      [imageKey]: null
    }))
  }

  const removeExistingImage = (index) => {
    setEditingProduct(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error("Please login again")
      setTimeout(() => window.location.href = '/login', 2000)
      return
    }

    const toastId = toast.loading('Updating product...')

    try {
      const formDataToSend = new FormData()
      
      formDataToSend.append('name', editingProduct.name)
      formDataToSend.append('description', editingProduct.description)
      formDataToSend.append('category', editingProduct.category)
      formDataToSend.append('subCategory', editingProduct.subCategory)
      formDataToSend.append('price', editingProduct.price)
      formDataToSend.append('sizes', JSON.stringify(editingProduct.sizes))
      formDataToSend.append('bestseller', editingProduct.bestseller)
      
      if (editingProduct.existingImages && editingProduct.existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(editingProduct.existingImages))
      }
      
      if (editImages.image1) formDataToSend.append('image1', editImages.image1)
      if (editImages.image2) formDataToSend.append('image2', editImages.image2)
      if (editImages.image3) formDataToSend.append('image3', editImages.image3)
      if (editImages.image4) formDataToSend.append('image4', editImages.image4)

      const response = await axios.put(`http://localhost:5000/api/product/update/${editingProduct._id}`, 
        formDataToSend,
        { 
          headers: { 
            'token': token,
            'Content-Type': 'multipart/form-data'
          } 
        }
      )

      if (response.data.success) {
        toast.success("Product updated successfully", { id: toastId })
        fetchProducts()
        setShowEditModal(false)
        setEditingProduct(null)
      } else {
        toast.error(response.data.message || "Failed to update product", { id: toastId })
      }
    } catch (error) {
      console.error("Error updating product:", error)
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.", { id: toastId })
        localStorage.removeItem('adminToken')
        setTimeout(() => window.location.href = '/login', 2000)
      } else {
        toast.error(error.response?.data?.message || "Error updating product", { id: toastId })
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center py-12 sm:py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-gray-300 border-t-black"></div>
          <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-black">Product List</h1>
        <div className="w-12 sm:w-16 h-0.5 bg-black mt-2"></div>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">{products.length} products found</p>
      </div>

      {/* Products Table - Desktop View (hidden on mobile) */}
      {products.length === 0 ? (
        <div className="border border-gray-200 p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-sm sm:text-base">No products found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 lg:gap-4 bg-gray-50 p-3 lg:p-4 border-b border-gray-200 text-xs font-medium text-gray-500">
              <div className="col-span-2">IMAGE</div>
              <div className="col-span-2">NAME</div>
              <div className="col-span-2">CATEGORY</div>
              <div className="col-span-2">SUB CATEGORY</div>
              <div className="col-span-2">PRICE</div>
              <div className="col-span-2">ACTIONS</div>
            </div>

            {/* Table Rows */}
            {products.map((product) => (
              <div key={product._id} className="grid grid-cols-12 gap-2 lg:gap-4 p-3 lg:p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-2">
                  <img 
                    src={product.image?.[0] || assets.upload_area} 
                    alt={product.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 object-cover border border-gray-200"
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-xs lg:text-sm text-black font-medium truncate" title={product.name}>
                    {product.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs lg:text-sm text-gray-600">{product.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs lg:text-sm text-gray-600">{product.subCategory || '-'}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs lg:text-sm text-black">${product.price}</p>
                </div>
                <div className="col-span-2 flex gap-2 lg:gap-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit product"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete product"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={product.image?.[0] || assets.upload_area} 
                      alt={product.name}
                      className="w-16 h-16 object-cover border border-gray-200"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-black truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Category: {product.category}</p>
                    <p className="text-xs text-gray-500">Sub: {product.subCategory || '-'}</p>
                    <p className="text-sm font-medium text-black mt-1">${product.price}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-xs text-gray-500 hover:text-blue-600 px-3 py-1 border border-gray-200 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-xs text-gray-500 hover:text-red-600 px-3 py-1 border border-gray-200 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal - Responsive */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-light text-black">Edit Product</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProduct(null)
                  }}
                  className="text-gray-400 hover:text-black"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
                {/* Image Upload Section - Responsive */}
                <div className="border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-sm font-medium text-black mb-3 sm:mb-4">PRODUCT IMAGES</h2>
                  
                  {/* Existing Images */}
                  {editingProduct.existingImages && editingProduct.existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">EXISTING IMAGES</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        {editingProduct.existingImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`Existing ${index + 1}`} 
                              className="w-full h-16 sm:h-20 object-cover border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-600 text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Upload */}
                  <p className="text-xs text-gray-500 mb-2">ADD NEW IMAGES</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    {[1, 2, 3, 4].map((num) => {
                      const imageKey = `image${num}`
                      return (
                        <div key={imageKey} className="relative group">
                          {editPreviewImages[imageKey] ? (
                            <div className="aspect-square border border-gray-200 overflow-hidden bg-gray-50">
                              <img 
                                src={editPreviewImages[imageKey]} 
                                alt={`New ${num}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditImage(imageKey)}
                                className="absolute -top-2 -right-2 bg-black text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[8px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="aspect-square border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleEditImageChange(e, imageKey)}
                                className="hidden"
                              />
                              <img 
                                src={assets.add_icon} 
                                alt="Add" 
                                className="w-5 h-5 sm:w-6 sm:h-6 opacity-40 mb-1"
                              />
                              <span className="text-[10px] sm:text-xs text-gray-400">Image {num}</span>
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-sm font-medium text-black mb-3 sm:mb-4">BASIC INFORMATION</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">PRODUCT NAME</label>
                      <input
                        type="text"
                        name="name"
                        value={editingProduct.name}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 text-black focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">DESCRIPTION</label>
                      <textarea
                        name="description"
                        value={editingProduct.description}
                        onChange={handleEditInputChange}
                        rows="3"
                        className="w-full px-3 py-2 text-sm border border-gray-200 text-black focus:outline-none focus:border-black resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Sub Category */}
                <div className="border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-sm font-medium text-black mb-3 sm:mb-4">CATEGORY</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CATEGORY</label>
                      <select
                        name="category"
                        value={editingProduct.category}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 text-black focus:outline-none focus:border-black"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">SUB CATEGORY</label>
                      <select
                        name="subCategory"
                        value={editingProduct.subCategory}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 text-black focus:outline-none focus:border-black"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Topwear">Topwear</option>
                        <option value="Bottomwear">Bottomwear</option>
                        <option value="Winterwear">Winterwear</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price & Size */}
                <div className="border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-sm font-medium text-black mb-3 sm:mb-4">PRICE & SIZE</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-full sm:max-w-xs">
                      <label className="block text-xs text-gray-500 mb-1">PRICE ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={editingProduct.price}
                        onChange={handleEditInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border border-gray-200 text-black focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-2">AVAILABLE SIZES</label>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {["S", "M", "L", "XL", "XXL"].map(size => (
                          <label key={size} className="flex items-center gap-1 sm:gap-2">
                            <input
                              type="checkbox"
                              checked={editingProduct.sizes.includes(size)}
                              onChange={() => handleEditSizeChange(size)}
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-gray-300"
                            />
                            <span className="text-xs sm:text-sm text-gray-700">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Seller */}
                <div className="border border-gray-200 p-4 sm:p-6">
                  <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bestseller"
                      checked={editingProduct.bestseller}
                      onChange={handleEditInputChange}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-gray-300"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">Mark as Best Seller</span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
                  >
                    UPDATE PRODUCT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingProduct(null)
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List