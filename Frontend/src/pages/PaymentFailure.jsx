import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import toast from "react-hot-toast";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(ShopContext);
  const [isClearing, setIsClearing] = useState(true);

  useEffect(() => {
    const effectKey = `payment_failure_handled_${searchParams.toString()}`;
    const alreadyHandled = Boolean(sessionStorage.getItem(effectKey));

    if (!alreadyHandled) {
      sessionStorage.setItem(effectKey, '1');
    }

    let timer;

    const handleFailure = async () => {
      const gateway = searchParams.get('gateway');
      const reason = searchParams.get('reason');

      console.log("Payment failure:", { gateway, reason, alreadyHandled });

      // In React StrictMode dev, this effect can run twice
      if (alreadyHandled) {
        setIsClearing(false);
        timer = setTimeout(() => {
          navigate('/order', { replace: true });
        }, 3000);
        return;
      }

      // Show appropriate error message
      let errorMessage = '';
      if (reason === 'cancelled') {
        errorMessage = 'Payment cancelled';
      } else if (reason === 'missing_pidx') {
        errorMessage = 'Payment verification failed';
      } else if (reason === 'verification_failed') {
        errorMessage = 'Payment could not be verified';
      } else {
        errorMessage = `Payment ${gateway ? `via ${gateway} ` : ''}failed`;
      }
      
      toast.error(errorMessage, { id: 'payment-failure-error' });

      try {
        // Use context clearCart (handles DB + local storage)
        console.log("🧹 Clearing cart via context...");
        if (clearCart) {
          await clearCart();
          console.log("✅ Context clearCart executed");
        } else {
          console.log("⚠️ clearCart not available in context");
        }

        console.log("✅ Cart clear routine completed");
        
        toast.success('Cart cleared successfully', { 
          id: 'payment-failure-cart-cleared', 
          icon: '🗑️' 
        });
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error('Error clearing cart', { id: 'payment-failure-cart-error' });
      } finally {
        setIsClearing(false);
      }

      // Clear all payment-related session storage
      sessionStorage.removeItem('khaltiPidx');
      sessionStorage.removeItem('pendingOrder');
      sessionStorage.removeItem('pendingCart');
      sessionStorage.removeItem('pendingPayment');
      sessionStorage.removeItem('paymentMethod');
      sessionStorage.removeItem(effectKey);

      timer = setTimeout(() => {
        navigate('/order', { replace: true });
      }, 3000);
    };

    handleFailure();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchParams, navigate, clearCart]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
        
        {/* Show clearing status */}
        {isClearing ? (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-red-500"></div>
            <p className="text-gray-500">Clearing cart...</p>
          </div>
        ) : (
          <p className="text-green-600 font-medium mb-2">✓ Cart has been cleared</p>
        )}
        
        <p className="text-gray-500 mb-6">
          Your payment was not successful. Your cart has been cleared and you will be redirected to orders page.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/order')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Orders
          </button>
          <button
            onClick={() => navigate('/collection')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}