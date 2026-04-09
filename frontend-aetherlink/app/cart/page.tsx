'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/orders/checkout`,
        { products: cartItems.map(p => ({ id: p.id, quantity: p.quantity })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.url;
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Checkout failed. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-800">Your Adventure Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
            </svg>
            <p className="text-gray-500 text-xl">Your cart is empty.</p>
            <Link 
              href="/products" 
              className="inline-block mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-12">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📡</div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-emerald-600 text-lg font-bold">${item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-200 text-gray-700 font-bold transition"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-800 text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 rounded-lg bg-white hover:bg-gray-200 text-gray-700 font-bold transition"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right min-w-25">
                        <p className="text-gray-400 text-sm">Subtotal</p>
                        <p className="text-2xl font-bold text-emerald-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 transition p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-gray-500 text-sm">Total Items</p>
                  <p className="text-3xl font-bold text-gray-800">{itemCount} items</p>
                  <p className="text-gray-500 text-sm mt-1">Total Amount</p>
                  <p className="text-5xl font-bold text-emerald-600">${total.toFixed(2)}</p>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 rounded-2xl font-semibold text-lg transition transform hover:scale-105 text-white shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    'Secure Checkout with Stripe →'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Login Prompt Modal - Beautiful instead of ugly alert */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">Please login to complete your purchase</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}