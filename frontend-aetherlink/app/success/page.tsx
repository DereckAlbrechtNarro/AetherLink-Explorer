'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Clear cart after successful payment
    localStorage.removeItem('cart');
    
    // Redirect countdown
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
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful! 🎉</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your adventure gear is on its way!
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-500 mb-2">Order Details</p>
          <p className="text-sm text-gray-700">Session ID: {sessionId?.slice(0, 20)}...</p>
          <p className="text-sm text-gray-700 mt-1">You will receive a confirmation email shortly.</p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/products" 
            className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/" 
            className="block w-full py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Redirecting to home in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}