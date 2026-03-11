import express from 'express';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import adminAuth from '../middleware/adminAuth.js'; // Import adminAuth middleware

const orderRoute = express.Router();

// Get user orders (for customers)
orderRoute.post('/my-orders', async (req, res) => {
    try {
        const { userEmail } = req.body;
        console.log("Fetching orders for email:", userEmail);
        
        if (!userEmail) {
            return res.json({ success: false, message: 'Email is required' });
        }
        
        const orders = await orderModel.find({ userEmail }).sort({ timestamp: -1 });
        console.log(`Found ${orders.length} orders`);
        
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.json({ success: false, message: error.message });
    }
});

// ✅ FIXED: Create new order - Use orderId from frontend if provided
orderRoute.post('/create', async (req, res) => {
    try {
        const { orderData, userEmail } = req.body;
        
        // Find user to get userId
        const user = await userModel.findOne({ email: userEmail });
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        // ✅ FIX: Use orderId from frontend if exists, otherwise generate
        const orderId = orderData.orderId || ('ORD' + Date.now() + Math.floor(Math.random() * 1000));
        
        // Check if order already exists (prevent duplicates)
        const existingOrder = await orderModel.findOne({ orderId });
        if (existingOrder) {
            return res.json({ 
                success: true, 
                message: 'Order already exists',
                order: existingOrder 
            });
        }
        
        const newOrder = new orderModel({
            ...orderData,
            orderId,  // Use the orderId from frontend or generated
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
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.json({ 
                success: false, 
                message: 'Order with this ID already exists' 
            });
        }
        
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
// In your orderRoute.js or paymentRoute.js
orderRoute.post('/admin/update-payment-status', adminAuth, async (req, res) => {
    try {
        const { orderId, paymentStatus } = req.body;
        
        if (!orderId || !paymentStatus) {
            return res.json({ success: false, message: 'Order ID and payment status are required' });
        }
        
        const updatedOrder = await orderModel.findOneAndUpdate(
            { orderId },
            { paymentStatus },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.json({ success: false, message: 'Order not found' });
        }
        
        res.json({
            success: true,
            message: 'Payment status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.json({ success: false, message: error.message });
    }
});

export default orderRoute;