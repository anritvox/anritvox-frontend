// src/pages/OrderSuccess.jsx
import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-10 w-full max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-4">
          Your order has been placed successfully. You will pay on delivery.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-bold text-gray-800">#{orderId}</span>
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/shop" className="bg-[#232f3e] text-white py-3 px-6 rounded font-semibold hover:bg-[#39d353] transition-colors">
            Continue Shopping
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
