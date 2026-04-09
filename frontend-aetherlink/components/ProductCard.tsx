'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductCard({ product, onAddToCart }: { 
  product: Product; 
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQuantity(1);
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-emerald-500 transition group">
      <div className="relative h-56">
        <Image 
          src={product.imageUrl || 'https://picsum.photos/id/1015/800/600'} 
          alt={product.name}
          fill 
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-3 right-3 bg-emerald-500 text-black px-2 py-1 rounded-lg text-xs font-bold">
          {product.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-white">{product.name}</h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{product.description}</p>
        
        <div className="text-2xl font-bold text-emerald-400 mb-4">${product.price}</div>
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-1">
            <button
              onClick={decrement}
              className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition"
            >
              -
            </button>
            <span className="w-10 text-center font-semibold text-white">{quantity}</span>
            <button
              onClick={increment}
              className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={handleAdd}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition disabled:opacity-70 text-white"
            disabled={added}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}