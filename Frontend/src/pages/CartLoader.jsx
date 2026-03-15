import { useEffect, useState } from "react";

export default function CartLoader() {
  const [loading, setLoading] = useState(true);
  const [timeoutError, setTimeoutError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let timer = setTimeout(() => {
      setLoading(false);
      setTimeoutError(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setTimeoutError(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          {/* Clean loader */}
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Loading text with dots */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-600">Loading</span>
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-100">.</span>
            <span className="animate-pulse delay-200">.</span>
          </div>

          {/* Subtle timeout warning */}
          <p className="text-xs text-gray-400 mt-4 animate-pulse">
            fetching your cart...
          </p>
        </div>
      </div>
    );
  }

  if (timeoutError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          {/* Simple error icon */}
          <div className="text-6xl mb-4 text-gray-300">🔍</div>
          
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Cart Unavailable
          </h3>
          
          <p className="text-gray-500 mb-6">
            Couldn't load your cart. Please try again.
          </p>

          {/* Retry button */}
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return null;
}