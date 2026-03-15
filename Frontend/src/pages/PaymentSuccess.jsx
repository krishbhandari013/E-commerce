import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "../App";
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext);
  const [verified, setVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (verified) return;
    
    const verifyPayment = async () => {
      setVerified(true);
      
      try {
        // Get ALL parameters from URL
        const gateway = searchParams.get('gateway');
        const orderId = searchParams.get('oid');
        const refId = searchParams.get('refId');
        const amt = searchParams.get('amt');
        const pidx = searchParams.get('pidx');
        
        console.log("=".repeat(60));
        console.log("🔵 PAYMENT SUCCESS PAGE LOADED");
        console.log("📍 Full URL:", window.location.href);
        console.log("📍 Parameters:", { gateway, orderId, refId, amt, pidx });
        console.log("=".repeat(60));

        // Get session data
        const khaltiPidx = sessionStorage.getItem('khaltiPidx');
        const pendingOrder = sessionStorage.getItem('pendingOrder');
        const pendingCart = sessionStorage.getItem('pendingCart');
        
        console.log("📦 Session Data:", {
          khaltiPidx: khaltiPidx || "not found",
          pendingOrder: pendingOrder ? "exists" : "not found",
          pendingCart: pendingCart ? "exists" : "not found"
        });

        // Try to parse pending order if exists
        let pendingOrderData = null;
        if (pendingOrder) {
          try {
            pendingOrderData = JSON.parse(pendingOrder);
            console.log("📦 Pending order data:", pendingOrderData);
          } catch (e) {
            console.error("Error parsing pendingOrder:", e);
          }
        }

        // Check for missing required parameters
        if (!gateway) {
          console.log("❌ Missing gateway - redirecting to failure");
          window.location.href = '/payment/failure?reason=missing_gateway';
          return;
        }

        if (!orderId) {
          console.log("❌ Missing order ID - redirecting to failure");
          window.location.href = '/payment/failure?reason=missing_order_id';
          return;
        }

        // Prepare verification data
        const verificationData = {
          gateway,
          orderId
        };

        if (gateway === 'khalti') {
          const pidxToUse = pidx || khaltiPidx;
          if (!pidxToUse) {
            console.log("❌ Missing pidx - redirecting to failure");
            window.location.href = `/payment/failure?gateway=khalti&reason=missing_pidx`;
            return;
          }
          verificationData.pidx = pidxToUse;
        } 
        else if (gateway === 'esewa') {
          if (!refId) {
            console.log("❌ Missing refId - redirecting to failure");
            window.location.href = `/payment/failure?gateway=esewa&reason=missing_refid`;
            return;
          }
          verificationData.refId = refId;
          verificationData.amt = amt;
        }

        console.log("📤 Sending verification data to backend:", verificationData);

        // Call backend to verify payment
        const response = await axios.post( `${backendUrl}/api/payment/verify`, verificationData);

        console.log("📥 Full verification response:", response.data);

        if (response.data.success) {
          console.log("✅ Payment verified successfully!");
          console.log("📦 Order data from backend:", response.data.order);
          
          // ✅ SUCCESS: Clear cart and all session data
          await clearCart(); // ⬅️ THIS IS THE ONLY PLACE clearCart() IS CALLED
          
          sessionStorage.removeItem('khaltiPidx');
          sessionStorage.removeItem('pendingCart');
          sessionStorage.removeItem('pendingOrder');
          sessionStorage.removeItem('pendingPayment');
          sessionStorage.removeItem('paymentMethod');
          
          // Store order data for display
          setOrderData(response.data.order);
          
          // Show success message and start countdown
          setShowSuccess(true);
          
          toast.success('Payment successful! Order confirmed.');
          
          // Start countdown timer
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                // Navigate to order page after countdown
                navigate('/order', { 
                  state: { 
                    orderData: response.data.order,
                    paymentSuccess: true 
                  } 
                });
              }
              return prev - 1;
            });
          }, 1000);
          
        } else {
          // ❌ FAILURE: Payment verification failed
          console.log("❌ Verification failed:", response.data);
          toast.error(response.data.message || 'Payment verification failed');

          // Keep cart so user can retry payment.
          sessionStorage.removeItem('khaltiPidx');
          sessionStorage.removeItem('pendingOrder');
          sessionStorage.removeItem('pendingPayment');
          sessionStorage.removeItem('paymentMethod');

          toast.success('Your cart items are still saved. You can try again.', { duration: 4000 });
          
          // Wait a moment then redirect to failure
          setTimeout(() => {
            window.location.href = `/payment/failure?gateway=${gateway}&reason=verification_failed`;
          }, 2000);
        }
      } catch (error) {
        // ❌ ERROR: Payment verification error
        console.error('❌ Payment verification error:', error);
        console.error('Error response:', error.response?.data);

        toast.error('Error verifying payment');
        
        const gateway = searchParams.get('gateway') || 'unknown';

        // Keep cart so user can retry payment.
        sessionStorage.removeItem('khaltiPidx');
        sessionStorage.removeItem('pendingOrder');
        sessionStorage.removeItem('pendingPayment');
        sessionStorage.removeItem('paymentMethod');

        toast.success('Your cart items are still saved. You can try again.', { duration: 4000 });
        
        // Wait a moment then redirect to failure
        setTimeout(() => {
          window.location.href = `/payment/failure?gateway=${gateway}&reason=verification_error`;
        }, 2000);
      } finally {
        // no-op
      }
    };

    verifyPayment();
  }, [searchParams, navigate, clearCart, verified]);

  // Show success message with countdown
  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-7xl mb-6 text-green-500">✅</div>
          <h2 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully.
          </p>
          {orderData && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Order ID:</p>
              <p className="font-mono font-bold text-lg">{orderData.orderId}</p>
              <p className="text-sm text-gray-600 mt-2">Payment Status:</p>
              <p className="font-bold text-md text-green-600">{orderData.paymentStatus}</p>
              <p className="text-sm text-gray-600 mt-2">Total Amount:</p>
              <p className="font-bold text-xl">${orderData.total?.toFixed(2)}</p>
            </div>
          )}
          <p className="text-gray-500 mb-4">
            Redirecting to your order in <span className="font-bold text-black">{countdown}</span> seconds...
          </p>
          <button
            onClick={() => {
              navigate('/order', { 
                state: { 
                  orderData: orderData,
                  paymentSuccess: true 
                } 
              });
            }}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Order Now
          </button>
        </div>
      </div>
    );
  }

  // Show debug info if verification failed


  // Show loading state while processing
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Processing Payment</h2>
        <p className="text-gray-500">Please wait while we verify your payment...</p>
      </div>
    </div>
  );
}