import { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { backendUrl } from '../App';
import toast from 'react-hot-toast';

export const ShopContext = createContext();

function ShopContextProvider(props) {
  const [cartItems, setCartItems] = useState([]); // ARRAY format with rich data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  
  const currency = '$';
  const delivery_free = 10;

  // ========== HELPER FUNCTIONS ==========
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Try to get price from item directly or from product lookup
      const price = item.productPrice || item.price || 0;
      return total + (price * item.quantity || 0);
    }, 0);
  };

  // Helper to get full product details for cart items
  const getEnrichedCartItems = () => {
    return cartItems.map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        productDetails: product || null,
        price: item.productPrice || product?.price || 0,
        name: item.productName || product?.name || 'Product'
      };
    });
  };

  // ========== LOCAL STORAGE FUNCTIONS ==========
  const loadCartFromLocal = () => {
    try {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        console.log("✅ Loaded cart from localStorage:", parsedCart);
      }
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
    }
  };

  const saveCartToLocal = (cart) => {
    if (!isLoggedIn) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
      console.log("✅ Saved cart to localStorage:", cart);
    }
  };

  // ========== DATABASE FUNCTIONS ==========
  const syncCartToDB = async (cartArray) => {
    console.log("🔵 syncCartToDB START ==================");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("userId:", userId);
    console.log("userToken exists:", !!userToken);
    console.log("Cart array:", cartArray);
    
    if (!isLoggedIn || !userId || !userToken) {
      console.log("⏭️ User not logged in - skipping DB sync");
      return;
    }
    
    try {
      console.log("📡 Sending to backend:", {
        url: `${backendUrl}/api/cart/update`,
        userId,
        cartData: cartArray
      });
      
      const response = await axios.post(`${backendUrl}/api/cart/update`, {
        userId,
        cartData: cartArray
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'token': userToken 
        }
      });
      
      console.log("📥 Backend response:", response.data);
      
      if (response.data.success) {
        console.log("✅ Cart successfully saved to database!");
      } else {
        console.log("❌ Backend returned error:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error syncing cart to DB:", error);
      if (error.response) {
        console.log("Server response:", error.response.data);
      }
    }
    console.log("🔵 syncCartToDB END ==================");
  };

  // Load cart from database as ARRAY
  const fetchCartFromDB = async (uid, token) => {
    try {
      console.log("📤 Fetching cart from DB for user:", uid);
      
      const response = await axios.post(`${backendUrl}/api/cart/get`, {
        userId: uid
      }, {
        headers: { 'token': token }
      });
      
      console.log("📥 Cart fetch response:", response.data);
      
      if (response.data.success) {
        const cartArray = response.data.cartData || [];
        console.log("✅ Cart array from DB:", cartArray);
        setCartItems(cartArray);
      } else {
        console.log("❌ Failed to fetch cart:", response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching cart from DB:', error);
    }
  };

  // ========== USER AUTH FUNCTIONS ==========
  const fetchUserData = async (token) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/get-user`, {}, {
        headers: { 'token': token }
      });
      
      if (response.data.success) {
        console.log("✅ User data:", response.data.user);
        setUserId(response.data.user._id);
        
        await fetchCartFromDB(response.data.user._id, token);
      } else {
        console.log("❌ Failed to fetch user data");
        setIsLoggedIn(false);
        loadCartFromLocal();
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      setIsLoggedIn(false);
      loadCartFromLocal();
    } finally {
      setLoading(false);
    }
  };

  // ========== CART OPERATIONS ==========
  const addToCart = async (productId, size, quantity = 1) => {
    console.log("🟢 addToCart called:", { productId, size, quantity, isLoggedIn });
    
    const product = products.find(p => p._id === productId);
    
    if (!product) {
      console.error("❌ Product not found:", productId);
      return;
    }
    
    const getProductImage = (product) => {
      if (!product) return '';
      if (product.image?.[0]) return product.image[0];
      if (product.images?.[0]) return product.images[0];
      if (product.img) return product.img;
      if (typeof product.image === 'string') return product.image;
      return '';
    };
    
    const productImage = getProductImage(product);
    
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === productId && item.size === size
      );

      let newCart;
      if (existingItemIndex >= 0) {
        newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
      } else {
        newCart = [...prev, {
          productId: product._id,
          productName: product.name,
          productPrice: product.price,
          size,
          quantity,
          productImage: productImage,
          category: product.category || '',
          subCategory: product.subCategory || ''
        }];
      }
      
      console.log("🟢 Updated cart with rich data:", newCart);
      
      if (isLoggedIn) {
        console.log("🟢 User is logged in - syncing to DB");
        syncCartToDB(newCart);
      } else {
        console.log("🟢 User is guest - saving to localStorage");
        saveCartToLocal(newCart);
      }
      
      return newCart;
    });
  };

  const removeFromCart = async (productId, size) => {
    setCartItems(prev => {
      const newCart = prev.filter(
        item => !(item.productId === productId && item.size === size)
      );
      
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

  const clearCart = async () => {
    console.log("🧹 Clearing cart...");
    setCartItems([]);
    
    if (isLoggedIn && userId && userToken) {
      try {
        await axios.post(`${backendUrl}/api/cart/clear`, {
          userId
        }, {
          headers: { 'token': userToken }
        });
        console.log("✅ Cart cleared from DB");
      } catch (error) {
        console.error('❌ Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('guestCart');
      console.log("✅ Guest cart cleared from localStorage");
    }
  };

  // ========== LOGIN/LOGOUT HANDLERS ==========
  const handleLogin = async (userData) => {
    const token = localStorage.getItem('userToken');
    console.log("🔐 User logged in:", userData);
    console.log("Token:", token);
    
    setUserToken(token);
    setIsLoggedIn(true);
    setUserId(userData._id);
    
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    console.log("🛒 Guest cart to merge:", guestCart);
    
    if (guestCart.length > 0) {
      for (const item of guestCart) {
        await addToCart(item.productId, item.size, item.quantity);
      }
      localStorage.removeItem('guestCart');
      console.log("✅ Guest cart merged with database");
    } else {
      await fetchCartFromDB(userData._id, token);
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out user");
    setIsLoggedIn(false);
    setUserId(null);
    setUserToken(null);
    setCartItems([]);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    toast.success('Logged out successfully');
  };

  // ========== INITIAL LOAD ==========
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('userToken');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log("🔍 Checking login status:", { 
        hasToken: !!token, 
        hasEmail: !!userEmail 
      });
      
      if (token && userEmail) {
        setUserToken(token);
        setIsLoggedIn(true);
        await fetchUserData(token);
      } else {
        loadCartFromLocal();
        setIsLoggedIn(false);
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // ========== FETCH PRODUCTS ==========
  const fetchProducts = async () => {
    try {
      console.log("📦 Fetching products...");
      const response = await axios.get(`${backendUrl}/api/product/list`);
      
      if (response.data.success) {
        setProducts(response.data.products);
        console.log("✅ Products loaded:", response.data.products.length);
      } else {
        setError(response.data.message || "Failed to fetch products");
        console.log("❌ Failed to fetch products:", response.data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setError(error.message || "Failed to connect to server");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========== CONTEXT VALUE ==========
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const enrichedCartItems = getEnrichedCartItems();

  const value = {
    products,
    loading,
    error,
    refetchProducts: fetchProducts,
    currency,
    delivery_free,
    cartItems: enrichedCartItems,
    cartCount,
    cartTotal,
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