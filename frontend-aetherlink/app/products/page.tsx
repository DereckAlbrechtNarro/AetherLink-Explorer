'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import axios from 'axios';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    // Fetch products
    axios.get(`${backendUrl}/api/products`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      const totalCount = parsedCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
      setCartCount(totalCount);
    }
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    let newCart;
    if (existingItem) {
      newCart = cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cartItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: quantity,
        imageUrl: product.imageUrl
      }];
    }
    
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    const totalCount = newCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    setCartCount(totalCount);
    
    // Trigger cart update event for navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-500 text-xl">Loading gear from orbit...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header with Back Button and Cart */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            
            <Link 
              href="/cart" 
              className="relative bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 transition flex items-center gap-2 text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">
          Our Explorer Gear
        </h1>
        <p className="text-gray-500 mb-12 max-w-2xl text-lg">
          Portable satellite terminals, rugged power stations, off-grid apparel & limited-edition collectibles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No products found. Make sure your backend is running.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}