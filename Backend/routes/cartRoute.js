import express from 'express';
import userModel from '../models/userModel.js';

const cartRoute = express.Router();

// Get user cart
cartRoute.post('/get', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      cartData: user.cartData || {}
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.json({ success: false, message: error.message });
  }
});

// Update user cart
cartRoute.post('/update', async (req, res) => {
  try {
    const { userId, cartData } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true }
    );
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cartData: user.cartData
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.json({ success: false, message: error.message });
  }
});

// Clear user cart
cartRoute.post('/clear', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.json({ success: false, message: error.message });
  }
});

export default cartRoute;