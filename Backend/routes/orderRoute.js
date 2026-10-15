import express from 'express';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import adminAuth from '../middleware/adminAuth.js'; // Import adminAuth middleware
import verifyToken from '../middleware/verifyToken.js';
import { myOrdersSchema, orderCreateSchema } from '../middleware/validate.js';

const orderRoute = express.Router();

// Server-authoritative pricing (mirrors the shop UI rules)
const DELIVERY_FEE = Number(process.env.DELIVERY_FEE || 10);
const TAX_RATE = Number(process.env.TAX_RATE || 0.1);

// Get user orders (for customers) — identity comes from the JWT, never the body
orderRoute.post('/my-orders', verifyToken, myOrdersSchema, async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('email');
        if (!user) {
            return res.json({ success: false, message: 'Authentication failed' });
        }

        const orders = await orderModel.find({ userEmail: user.email }).sort({ timestamp: -1 });
        console.log(`Found ${orders.length} orders`);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.json({ success: false, message: 'Could not fetch orders. Please try again.' });
    }
});

// Create new order - authenticated; prices recomputed from the DB, client totals ignored
orderRoute.post('/create', verifyToken, orderCreateSchema, async (req, res) => {
    try {
        const { orderData } = req.body;

        // Identity comes from the token — the body's userEmail (if any) is ignored
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.json({ success: false, message: 'Authentication failed' });
        }

        // Use orderId from frontend if provided, otherwise generate
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

        // Rebuild items from database prices — never trust client-supplied prices
        const items = [];
        for (const item of orderData.items) {
            const product = await productModel.findById(item.productId).select('name price image');
            if (!product) {
                return res.status(400).json({ success: false, message: 'Invalid request data' });
            }
            const price = Number(product.price);
            const quantity = Number(item.quantity);
            items.push({
                name: product.name,
                price,
                quantity,
                size: item.size || '',
                image: Array.isArray(product.image) ? product.image[0] : product.image,
                total: Math.round(price * quantity * 100) / 100
            });
        }

        const subtotal = Math.round(items.reduce((s, i) => s + i.total, 0) * 100) / 100;
        const shipping = subtotal > 0 ? DELIVERY_FEE : 0;
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const total = Math.round((subtotal + shipping + tax) * 100) / 100;

        const newOrder = new orderModel({
            orderId,
            items,
            subtotal,
            shipping,
            tax,
            total,
            status: orderData.paymentMethod === 'cod' ? 'Confirmed' : 'Pending',
            customer: orderData.customer,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending',
            userEmail: user.email,
            userId: user._id,
            timestamp: new Date(),
            date: orderData.date || new Date().toISOString().split('T')[0]
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

        res.json({ success: false, message: 'Could not place order. Please try again.' });
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
        res.json({ success: false, message: 'Could not fetch orders. Please try again.' });
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
        res.json({ success: false, message: 'Could not update order. Please try again.' });
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
        res.json({ success: false, message: 'Could not update order. Please try again.' });
    }
});

export default orderRoute;