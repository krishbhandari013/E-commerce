// order.jsx
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [orderData, navigate]);

  // If no order data, show redirect message
  if (!orderData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No order information found. Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Order Header */}
        <div className="bg-gray-50 p-6 border-b">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-semibold">{orderData.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-semibold">{orderData.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold capitalize">
                {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} (Size: {item.size}) x {item.quantity}
                </span>
                <span className="font-medium">
                  {orderData.currency}{item.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="p-6 border-b">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{orderData.currency}{orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{orderData.currency}{orderData.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{orderData.currency}{orderData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-4 border-t">
              <span>Total</span>
              <span>{orderData.currency}{orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-6">
          <h2 className="font-semibold mb-4">Delivery Address</h2>
          <p className="text-gray-700">{orderData.customer.fullName}</p>
          <p className="text-gray-600 text-sm">{orderData.customer.address}</p>
          <p className="text-gray-600 text-sm">
            {orderData.customer.city}, {orderData.customer.zipCode}
          </p>
          <p className="text-gray-600 text-sm mt-2">📞 {orderData.customer.phone}</p>
          <p className="text-gray-600 text-sm">📧 {orderData.customer.email}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          to="/collection"
          className="flex-1 bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="flex-1 bg-white text-black border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go to Home
        </Link>
      </div>

      {/* Email Confirmation */}
      <p className="text-center text-sm text-gray-500 mt-6">
        A confirmation email has been sent to {orderData.customer.email}
      </p>
    </div>
  );
}