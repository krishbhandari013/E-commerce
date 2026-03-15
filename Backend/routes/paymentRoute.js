import express from 'express';
import axios from 'axios';
import orderModel from '../models/orderModel.js';


const paymentRoute = express.Router();

// Khalti secret key configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '97c5b932633d4ebf86fff5f33920613a';

// ==================== KHALTI V2 API ROUTES ====================

// Khalti payment initiation
paymentRoute.post('/khalti/initiate', async (req, res) => {
    try {
        const { orderData } = req.body;
        
        if (!orderData || !orderData.orderId || !orderData.total) {
            return res.json({
                success: false,
                message: 'Missing required order data'
            });
        }
        
        const initiateData = {
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?gateway=khalti&oid=${orderData.orderId}`,
            website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
            amount: Math.round(orderData.total * 100).toString(),
            purchase_order_id: orderData.orderId,
            purchase_order_name: `Order ${orderData.orderId}`,
            customer_info: {
                name: orderData.customer.fullName,
                email: orderData.customer.email,
                phone: orderData.customer.phone
            }
        };

        const khaltiInitiateUrl = 'https://dev.khalti.com/api/v2/epayment/initiate/';
        
        const response = await axios.post(khaltiInitiateUrl, initiateData, {
            headers: {
                'Authorization': `key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.pidx) {
            // Store pidx in database
            await orderModel.findOneAndUpdate(
                { orderId: orderData.orderId },
                { 
                    paymentDetails: {
                        pidx: response.data.pidx,
                        payment_url: response.data.payment_url,
                        initiatedAt: new Date()
                    }
                }
            );

            res.json({
                success: true,
                pidx: response.data.pidx,
                payment_url: response.data.payment_url,
                message: 'Payment initiated successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Failed to initiate payment',
                khaltiResponse: response.data
            });
        }
    } catch (error) {
        console.error('Khalti initiation error:', error.response?.data || error.message);
        
        if (error.response) {
            res.json({
                success: false,
                message: error.response.data?.detail || 'Khalti API error',
                statusCode: error.response.status,
                error: error.response.data
            });
        } else if (error.request) {
            res.json({
                success: false,
                message: 'Cannot connect to Khalti server',
                error: error.message
            });
        } else {
            res.json({
                success: false,
                message: error.message
            });
        }
    }
});

// Khalti payment verification with pidx lookup - FIXED to update paymentStatus
paymentRoute.post('/khalti/verify', async (req, res) => {
    try {
        const { pidx, orderId } = req.body;
        
        console.log("=".repeat(50));
        console.log("KHALTI VERIFICATION REQUEST:");
        console.log("Order ID from request:", orderId);
        console.log("PIDX:", pidx);
        console.log("=".repeat(50));
        
        if (!pidx) {
            return res.json({
                success: false,
                message: 'Missing pidx'
            });
        }
        
        // Lookup payment status using pidx
        const lookupUrl = 'https://dev.khalti.com/api/v2/epayment/lookup/';
        
        const response = await axios.post(lookupUrl, { pidx }, {
            headers: {
                'Authorization': `key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Khalti lookup response:", response.data);

        if (response.data && response.data.status === 'Completed') {
            // Try to find order by multiple possible ID formats
            let order = null;
            
            // Try 1: Find by exact orderId
            order = await orderModel.findOne({ orderId });
            
            // Try 2: If not found, try to find by orderId without prefix
            if (!order && orderId.startsWith('ORD-')) {
                const orderNumber = orderId.replace('ORD-', '');
                order = await orderModel.findOne({ 
                    orderId: { $regex: orderNumber, $options: 'i' } 
                });
            }
            
            // Try 3: Try to find by pidx in paymentDetails
            if (!order) {
                order = await orderModel.findOne({ 
                    'paymentDetails.pidx': pidx 
                });
            }
            
            // Try 4: List recent orders for debugging
            if (!order) {
                console.log("⚠️ Order not found with any method. Recent orders:");
                const recentOrders = await orderModel.find().sort({ createdAt: -1 }).limit(5);
                recentOrders.forEach(o => {
                    console.log(`- ${o.orderId} (${o._id})`);
                });
            }
            
            if (!order) {
                return res.json({
                    success: false,
                    message: 'Order not found',
                    debug: { searchedOrderId: orderId }
                });
            }

            // Update the found order
            const updatedOrder = await orderModel.findOneAndUpdate(
                { _id: order._id },
                { 
                    paymentStatus: 'paid',
                    status: 'Confirmed',
                    paymentDetails: {
                        ...response.data,
                        verifiedAt: new Date()
                    }
                },
                { new: true }
            );

            console.log("✅ Order updated successfully:", updatedOrder.orderId, "Status:", updatedOrder.paymentStatus);

            res.json({
                success: true,
                message: 'Payment verified successfully',
                order: updatedOrder,
                gatewayResponse: response.data
            });
        } else {
            console.log("❌ Payment not completed:", response.data?.status);
            res.json({
                success: false,
                message: 'Payment not completed',
                status: response.data?.status,
                gatewayResponse: response.data
            });
        }
    } catch (error) {
        console.error('Khalti verification error:', error.response?.data || error.message);
        res.json({
            success: false,
            message: error.response?.data?.detail || error.message,
            error: error.response?.data
        });
    }
});

// ==================== UNIFIED VERIFICATION ENDPOINT ====================

paymentRoute.post('/verify', async (req, res) => {
    try {
        const { gateway, orderId, pidx, refId, amt } = req.body;
        
        console.log("=".repeat(60));
        console.log("🔵 UNIFIED VERIFY ENDPOINT HIT");
        console.log("Gateway:", gateway);
        console.log("Order ID from request:", orderId);
        console.log("PIDX:", pidx);
        console.log("RefId:", refId);
        console.log("Amount:", amt);
        console.log("=".repeat(60));
        
        if (!gateway || !orderId) {
            return res.json({
                success: false,
                message: 'Missing required parameters'
            });
        }
        
        if (gateway === 'khalti') {
            if (!pidx) {
                return res.json({
                    success: false,
                    message: 'Missing pidx for Khalti verification'
                });
            }
            
            const lookupUrl = 'https://dev.khalti.com/api/v2/epayment/lookup/';
            
            try {
                const response = await axios.post(lookupUrl, { pidx }, {
                    headers: {
                        'Authorization': `key ${KHALTI_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log("Khalti lookup response:", response.data);

                if (response.data && response.data.status === 'Completed') {
                    // Try to find order by multiple possible ID formats
                    let order = null;
                    
                    // Try 1: Find by exact orderId
                    order = await orderModel.findOne({ orderId });
                    
                    // Try 2: If not found, try to find by orderId without prefix
                    if (!order && orderId.startsWith('ORD-')) {
                        const orderNumber = orderId.replace('ORD-', '');
                        order = await orderModel.findOne({ 
                            orderId: { $regex: orderNumber, $options: 'i' } 
                        });
                    }
                    
                    // Try 3: Try to find by pidx in paymentDetails
                    if (!order) {
                        order = await orderModel.findOne({ 
                            'paymentDetails.pidx': pidx 
                        });
                    }
                    
                    if (!order) {
                        console.log("⚠️ Order not found with any method. Searched for:", orderId);
                        return res.json({
                            success: false,
                            message: 'Order not found',
                            debug: { searchedOrderId: orderId }
                        });
                    }

                    // Update the found order
                    const updatedOrder = await orderModel.findOneAndUpdate(
                        { _id: order._id },
                        { 
                            paymentStatus: 'paid',
                            status: 'Confirmed',
                            paymentDetails: {
                                ...response.data,
                                verifiedAt: new Date(),
                                gateway: 'khalti'
                            }
                        },
                        { new: true }
                    );

                    console.log("✅ Order updated successfully:", updatedOrder?.orderId, "Status:", updatedOrder?.paymentStatus);

                    return res.json({
                        success: true,
                        message: 'Payment verified successfully',
                        order: updatedOrder
                    });
                } else {
                    return res.json({
                        success: false,
                        message: 'Payment not completed',
                        status: response.data?.status
                    });
                }
            } catch (khaltiError) {
                console.error("Khalti API error:", khaltiError.response?.data || khaltiError.message);
                return res.json({
                    success: false,
                    message: khaltiError.response?.data?.detail || 'Khalti verification failed'
                });
            }
        }
        else if (gateway === 'esewa') {
            if (!refId || !amt) {
                return res.json({
                    success: false,
                    message: 'Missing refId or amt for eSewa verification'
                });
            }
            
            const verificationUrl = 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
            
            const params = {
                amt: amt,
                rid: refId,
                pid: orderId,
                scd: 'EPAYTEST'
            };

            try {
                const response = await axios.get(verificationUrl, { params });
                
                console.log("eSewa lookup response:", response.data);

                if (response.data && response.data.status === 'COMPLETE') {
                    // Try to find order by multiple possible ID formats
                    let order = null;
                    
                    // Try 1: Find by exact orderId
                    order = await orderModel.findOne({ orderId });
                    
                    // Try 2: If not found, try to find by orderId without prefix
                    if (!order && orderId.startsWith('ORD-')) {
                        const orderNumber = orderId.replace('ORD-', '');
                        order = await orderModel.findOne({ 
                            orderId: { $regex: orderNumber, $options: 'i' } 
                        });
                    }
                    
                    if (!order) {
                        return res.json({
                            success: false,
                            message: 'Order not found',
                            debug: { searchedOrderId: orderId }
                        });
                    }

                    const updatedOrder = await orderModel.findOneAndUpdate(
                        { _id: order._id },
                        { 
                            paymentStatus: 'paid',
                            status: 'Confirmed',
                            paymentDetails: {
                                ...response.data,
                                verifiedAt: new Date(),
                                gateway: 'esewa'
                            }
                        },
                        { new: true }
                    );

                    return res.json({
                        success: true,
                        message: 'Payment verified successfully',
                        order: updatedOrder
                    });
                } else {
                    return res.json({
                        success: false,
                        message: 'Payment verification failed',
                        gatewayResponse: response.data
                    });
                }
            } catch (esewaError) {
                console.error("eSewa API error:", esewaError.response?.data || esewaError.message);
                return res.json({
                    success: false,
                    message: 'eSewa verification failed'
                });
            }
        }
        
        res.json({
            success: false,
            message: 'Invalid gateway'
        });
        
    } catch (error) {
        console.error('Payment verification error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// Debug endpoint to check orders


export default paymentRoute;