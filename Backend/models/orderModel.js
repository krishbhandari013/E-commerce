import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true, index: true }, // ✅ Add index for faster queries
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true }, // ✅ Add index
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        size: String,
        image: String,
        total: { type: Number, required: true, min: 0 }
    }],
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], // ✅ Restrict to valid statuses
        default: 'Confirmed' 
    },
    customer: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    paymentMethod: { 
        type: String, 
        enum: ['cod', 'card', 'khalti', 'esewa'], // ✅ Restrict payment methods
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending' 
    },
    paymentDetails: { type: Object }, // ✅ Store payment gateway response
    timestamp: { type: Date, default: Date.now, index: true }, // ✅ Add index for sorting
    date: { type: String, required: true }
}, {
    timestamps: true // ✅ Automatically add createdAt and updatedAt
});

// ✅ Add compound index for common queries
orderSchema.index({ userEmail: 1, timestamp: -1 });
orderSchema.index({ status: 1, timestamp: -1 });

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;