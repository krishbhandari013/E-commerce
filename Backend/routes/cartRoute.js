import express from 'express';
import userModel from '../models/userModel.js';
import verifyToken from '../middleware/verifyToken.js';
import { cartGetSchema, cartUpdateSchema, cartClearSchema } from '../middleware/validate.js';

const cartRoute = express.Router();

// Users may only touch their own cart: body userId must match the JWT identity
const ownCartOrDeny = (req, res) => {
  if (req.body.userId !== req.userId) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return false;
  }
  return true;
};

// Get user cart - FIXED for array format
cartRoute.post('/get', verifyToken, cartGetSchema, async (req, res) => {
  try {
    if (!ownCartOrDeny(req, res)) return;

    const user = await userModel.findById(req.userId);
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
    res.json({ success: false, message: 'Could not fetch cart. Please try again.' });
  }
});

// Update user cart - FIXED for array format
cartRoute.post('/update', verifyToken, cartUpdateSchema, async (req, res) => {
  try {
    if (!ownCartOrDeny(req, res)) return;

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
      message: 'Could not update cart. Please try again.'
    });
  }
});

// Clear user cart - FIXED for array format
cartRoute.post('/clear', verifyToken, cartClearSchema, async (req, res) => {
  try {
    if (!ownCartOrDeny(req, res)) return;

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
      message: 'Could not clear cart. Please try again.'
    });
  }
});

export default cartRoute;