import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const CartTool = ({ cartItems, currency }) => {
  const { delivery_free } = useContext(ShopContext);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal > 100 ? 0 : delivery_free;
  const tax = subtotal * 0.10;
  const total = subtotal + shipping + tax;

  const formatCurrency = (amount) => `${currency}${amount.toFixed(2)}`;

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        Order Summary
      </h3>
      
      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-semibold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">{formatCurrency(total)}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="block w-full bg-gray-900 text-white text-center py-2 text-sm hover:bg-gray-800 transition-colors rounded"
      >
        Checkout
      </Link>
    </div>
  );
};

export default CartTool;