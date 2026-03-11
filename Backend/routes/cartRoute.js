import express from 'express';
import userModel from '../models/userModel.js';

const cartRoute = express.Router();

// Get user cart - FIXED for array format
cartRoute.post('/get', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // ✅ Cart is already an array in your new schema
    const cartArray = user.cartData || [];
    
    console.log("📤 Cart data retrieved:", cartArray);
    
    res.json({
      success: true,
      cartData: cartArray // Send array directly
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.json({ success: false, message: error.message });
  }
});

// Update user cart - FIXED for array format
cartRoute.post('/update', async (req, res) => {
  try {
    const { userId, cartData } = req.body;
    
    console.log("📦 UPDATE cart request:", { userId, cartData });

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // ✅ Validate cartData is an array
    if (!Array.isArray(cartData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart data must be an array' 
      });
    }

    // ✅ Update with array
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { cartData: cartData } }, // Set array directly
      { new: true, runValidators: true }
    ).select('cartData');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log("✅ Cart updated successfully:", user.cartData);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cartData: user.cartData
    });
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Clear user cart - FIXED for array format
cartRoute.post('/clear', async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("🧹 CLEAR cart request for user:", userId);

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { cartData: [] } }, // ✅ Set empty array, not empty object
      { new: true }
    );
    
    console.log("✅ Cart cleared for user:", userId);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default cartRoute;