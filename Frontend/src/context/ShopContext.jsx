import { createContext, useState, useEffect } from "react";
import axios from 'axios'

export const ShopContext = createContext();

function ShopContextProvider(props) {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currency = '$';
  const delivery_free = 10;

  // Fetch products from backend on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Use the backendUrl from App.jsx or hardcode for now
      const response = await axios.get(`http://localhost:5000/api/product/list`);
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId, size, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        item => item.productId === productId && item.size === size
      );

      if (existingItem) {
        return prev.map(item =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { productId, size, quantity }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => 
      prev.filter(item => !(item.productId === productId && item.size === size))
    );
  };

  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p._id === item.productId);
      return total + (product?.price * item.quantity || 0);
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = getCartCount();

  const value = {
    products,
    loading,
    error,
    refetchProducts: fetchProducts,
    currency,
    delivery_free,
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getCartTotal,
    clearCart
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
}

export default ShopContextProvider;