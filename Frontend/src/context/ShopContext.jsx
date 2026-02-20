// Updated ShopContext.jsx with addToCart function and cartCount
import { createContext, useState } from "react";
import { products } from "../assets/assets";

export const ShopContext = createContext();

function ShopContextProvider(props) {
  const [cartItems, setCartItems] = useState([]);
  const currency = '$';
  const delivery_free = 10;

  const addToCart = (productId, size, quantity) => {
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

  // Calculate cart count for easier access
  const cartCount = getCartCount();

  const value = {
    products,
    currency,
    delivery_free,
    cartItems,
    cartCount, // Added cartCount here
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getCartTotal
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
}

export default ShopContextProvider;