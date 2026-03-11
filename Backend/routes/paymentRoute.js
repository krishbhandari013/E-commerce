import express from 'express';
import axios from 'axios';
import orderModel from '../models/orderModel.js';

const paymentRoute = express.Router();

// Khalti payment verification
// In your paymentRoute.js, update the Khalti verification:

// Khalti payment verification
paymentRoute.post('/khalti/verify', async (req, res) => {
    try {
        const { payload, orderData, userEmail } = req.body;
        
        console.log("Khalti verification payload:", payload);
        
        // Verify with Khalti API
        const response = await axios.post('https://khalti.com/api/v2/payment/verify/', {
            token: payload.token,
            amount: payload.amount
        }, {
            headers: {
                'Authorization': 'Key test_secret_key_f59e8b7d18b4499ca40f68195a846e9b' // Replace with your secret key
            }
        });

        console.log("Khalti verification response:", response.data);

        if (response.data && response.data.state === 'Completed') {
            // Payment verified successfully
            res.json({
                success: true,
                message: 'Payment verified successfully',
                paymentDetails: response.data
            });
        } else {
            res.json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Khalti verification error:', error);
        res.json({
            success: false,
            message: error.response?.data?.detail || error.message
        });
    }
});

// eSewa payment verification
paymentRoute.post('/esewa/verify', async (req, res) => {
    try {
        const { data, orderId } = req.body;
        
        // eSewa verification endpoint
        const verificationUrl = 'https://uat.esewa.com.np/epay/transrec';
        
        const params = new URLSearchParams({
            amt: data.amt,
            rid: data.refId,
            pid: orderId,
            scd: 'your_merchant_id' // Replace with your merchant ID
        });

        const response = await axios.post(verificationUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Check response (eSewa returns plain text)
        if (response.data.includes('Success')) {
            // Update order payment status
            await orderModel.findOneAndUpdate(
                { orderId },
                { 
                    paymentStatus: 'paid',
                    'paymentDetails.refId': data.refId,
                    'paymentDetails.verifiedAt': new Date()
                }
            );

            res.json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('eSewa verification error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

export default paymentRoute;