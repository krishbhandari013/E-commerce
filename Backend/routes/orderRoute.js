import express from 'express';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import adminAuth from '../middleware/adminAuth.js'; // Import adminAuth middleware

const orderRoute = express.Router();

// Get user orders (for customers)
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

// ✅ ADMIN ROUTE: Get all orders (admin only)
orderRoute.get('/admin/all', adminAuth, async (req, res) => {
    try {
        console.log('Admin fetching all orders');
        
        const orders = await orderModel.find({}).sort({ timestamp: -1 });
        
        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.json({ success: false, message: error.message });
    }
});

// ✅ ADMIN ROUTE: Update order status (admin only)
orderRoute.post('/admin/update-status', adminAuth, async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.json({ success: false, message: 'Order ID and status are required' });
        }
        
        const updatedOrder = await orderModel.findOneAndUpdate(
            { orderId },
            { status },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.json({ success: false, message: 'Order not found' });
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.json({ success: false, message: error.message });
    }
});

export default orderRoute;