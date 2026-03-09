import express from 'express';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

const orderRoute = express.Router();

// Get user orders
orderRoute.post('/my-orders', async (req, res) => {
    try {
        const { userEmail } = req.body;
        
        const orders = await orderModel.find({ userEmail }).sort({ timestamp: -1 });
        
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.json({ success: false, message: error.message });
    }
});

// Create new order
orderRoute.post('/create', async (req, res) => {
    try {
        const { orderData, userEmail } = req.body;
        
        // Find user to get userId
        const user = await userModel.findOne({ email: userEmail });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // Generate unique order ID
        const orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        
        const newOrder = new orderModel({
            ...orderData,
            orderId,
            userEmail,
            userId: user._id,
            timestamp: new Date()
        });
        
        await newOrder.save();
        
        res.json({
            success: true,
            message: 'Order placed successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.json({ success: false, message: error.message });
    }
});

// Update order status
orderRoute.post('/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const updatedOrder = await orderModel.findOneAndUpdate(
            { orderId },
            { status },
            { new: true }
        );
        
        res.json({
            success: true,
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.json({ success: false, message: error.message });
    }
});

export default orderRoute;