import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    // ❌ DO NOT define _id here - MongoDB creates it automatically
    
    // ✅ Custom fields
    orderId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        image: String,
        total: Number
    }],
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    status: { type: String, default: 'Confirmed' },
    customer: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        zipCode: String
    },
    paymentMethod: String,
    timestamp: { type: Date, default: Date.now },
    date: String
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;