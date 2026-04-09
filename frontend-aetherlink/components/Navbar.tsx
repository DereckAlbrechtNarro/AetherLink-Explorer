'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load cart count
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const totalCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalCount);
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        const cart = JSON.parse(updatedCart);
        const totalCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalCount);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.email.split('@')[0];
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition shadow-md">
            A
          </div>
          <h1 className="text-xl font-bold text-gray-800">AetherLink Explorer</h1>
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link href="/products" className="text-gray-600 hover:text-emerald-600 transition font-medium">
            Shop Gear
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-emerald-600 transition font-medium relative">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Admin link - only shows for admin users */}
          {user?.role === 'admin' && (
            <Link 
              href="/admin/products" 
              className="text-gray-600 hover:text-emerald-600 transition font-medium"
            >
              Admin Panel
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Hi, {getDisplayName()}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md hover:shadow-lg"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}