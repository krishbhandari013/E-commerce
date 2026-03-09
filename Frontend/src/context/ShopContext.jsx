import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';

export const ShopContext = createContext();

function ShopContextProvider(props) {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const currency = '$';
  const delivery_free = 10;

  // Check login status and get user ID on mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
      setIsLoggedIn(true);
      fetchUserData(token);
    } else {
      // Load cart from localStorage for guest users
      loadCartFromLocal();
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // Load cart from localStorage for guests
  const loadCartFromLocal = () => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  };

  // Save cart to localStorage for guests
  const saveCartToLocal = (cart) => {
    if (!isLoggedIn) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  };

  // Fetch user data using token
  const fetchUserData = async (token) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/user/get-user`, {}, {
        headers: { 'token': token }
      });
      
      if (response.data.success) {
        setUserId(response.data.user._id);
        // Load cart from database
        fetchCartFromDB(response.data.user._id, token);
      } else {
        setIsLoggedIn(false);
        loadCartFromLocal();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setIsLoggedIn(false);
      loadCartFromLocal();
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from database
  const fetchCartFromDB = async (uid, token) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/user/cart/get`, {
        userId: uid
      }, {
        headers: { 'token': token }
      });
      
      if (response.data.success) {
        // Convert cart object to array format
        const cartObject = response.data.cartData || {};
        const cartArray = [];
        
        Object.keys(cartObject).forEach(productId => {
          Object.keys(cartObject[productId]).forEach(size => {
            cartArray.push({
              productId,
              size,
              quantity: cartObject[productId][size]
            });
          });
        });
        
        setCartItems(cartArray);
      }
    } catch (error) {
      console.error('Error fetching cart from DB:', error);
    }
  };

  // Sync cart to database
  const syncCartToDB = async (cartArray) => {
    if (!isLoggedIn || !userId) return;
    
    // Convert array to object format for database
    const cartObject = {};
    cartArray.forEach(item => {
      if (!cartObject[item.productId]) {
        cartObject[item.productId] = {};
      }
      cartObject[item.productId][item.size] = item.quantity;
    });
    
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(`http://localhost:5000/api/user/cart/update`, {
        userId,
        cartData: cartObject
      }, {
        headers: { 'token': token }
      });
      console.log('Cart synced to DB:', cartObject);
    } catch (error) {
      console.error('Error syncing cart to DB:', error);
    }
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/product/list`);
      
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to connect to server");
    }
  };

  const addToCart = async (productId, size, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        item => item.productId === productId && item.size === size
      );

      let newCart;
      if (existingItem) {
        newCart = prev.map(item =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, { productId, size, quantity }];
      }
      
      // Sync to database if logged in, else save to localStorage
      if (isLoggedIn) {
        syncCartToDB(newCart);
      } else {
        saveCartToLocal(newCart);
      }
      
      return newCart;
    });
  };

  const removeFromCart = async (productId, size) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => !(item.productId === productId && item.size === size));
      
      if (isLoggedIn) {
        syncCartToDB(newCart);
      } else {
        saveCartToLocal(newCart);
      }
      
      return newCart;
    });
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      );
      
      if (isLoggedIn) {
        syncCartToDB(newCart);
      } else {
        saveCartToLocal(newCart);
      }
      
      return newCart;
    });
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

  const clearCart = async () => {
    setCartItems([]);
    
    if (isLoggedIn && userId) {
      try {
        const token = localStorage.getItem('userToken');
        await axios.post(`http://localhost:5000/api/user/cart/clear`, {
          userId
        }, {
          headers: { 'token': token }
        });
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('guestCart');
    }
  };

  // Login handler - to be called from Login component
  const handleLogin = async (userData) => {
    setIsLoggedIn(true);
    setUserId(userData._id);
    
    // Merge guest cart with database cart
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      // Add guest cart items to database
      for (const item of guestCart) {
        await addToCart(item.productId, item.size, item.quantity);
      }
      localStorage.removeItem('guestCart');
    } else {
      // Just fetch existing cart from DB
      await fetchCartFromDB(userData._id, localStorage.getItem('userToken'));
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setCartItems([]);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
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
    clearCart,
    userId,
    isLoggedIn,
    handleLogin,
    handleLogout
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
}

export default ShopContextProvider;