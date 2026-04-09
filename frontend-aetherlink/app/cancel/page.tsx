'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CancelPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left border border-yellow-100">
          <p className="text-sm text-yellow-800">
            💡 Tip: You can try checking out again or contact support if you need assistance.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/cart" 
            className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition"
          >
            Return to Cart
          </Link>
          <Link 
            href="/products" 
            className="block w-full py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Redirecting to home in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}