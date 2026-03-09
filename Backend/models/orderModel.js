import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
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
    status: { 
        type: String, 
        enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Confirmed'
    },
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
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { minimize: false });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;