import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import toast from 'react-hot-toast'

const List = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

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
        // Remove product from state
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black"></div>
          <p className="text-gray-500 mt-2">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black">Product List</h1>
        <div className="w-16 h-0.5 bg-black mt-2"></div>
        <p className="text-gray-400 text-sm mt-2">{products.length} products found</p>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No products found</p>
        </div>
      ) : (
        <div className="border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-200 text-xs font-medium text-gray-500">
            <div className="col-span-2">IMAGE</div>
            <div className="col-span-3">NAME</div>
            <div className="col-span-2">CATEGORY</div>
            <div className="col-span-2">SUB CATEGORY</div>
            <div className="col-span-2">PRICE</div>
            <div className="col-span-1">ACTION</div>
          </div>

          {/* Table Rows */}
          {products.map((product) => (
            <div key={product._id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
              {/* Image */}
              <div className="col-span-2">
                <img 
                  src={product.image?.[0] || assets.upload_area} 
                  alt={product.name}
                  className="w-12 h-12 object-cover border border-gray-200"
                />
              </div>

              {/* Name */}
              <div className="col-span-3">
                <p className="text-sm text-black font-medium">{product.name}</p>
              </div>

              {/* Category */}
              <div className="col-span-2">
                <span className="text-xs text-gray-600">{product.category}</span>
              </div>

              {/* Sub Category */}
              <div className="col-span-2">
                <span className="text-xs text-gray-600">{product.subCategory || '-'}</span>
              </div>

              {/* Price */}
              <div className="col-span-2">
                <p className="text-sm text-black">${product.price}</p>
              </div>

              {/* Action - Delete Button */}
              <div className="col-span-1">
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default List