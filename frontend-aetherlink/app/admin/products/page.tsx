'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (userData.role !== 'admin') {
        window.location.href = '/';
      }
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${backendUrl}/api/products`);
    setProducts(res.data);
  };

  const updateImage = async (id: number, imageUrl: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/products/${id}`,
        { imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProducts();
      setEditingId(null);
      setTempImageUrl('');
      alert('✅ Image updated successfully!');
    } catch (error) {
      alert('❌ Failed to update. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Access Denied</p>
          <p className="text-gray-500 mt-2">Admin access only</p>
          <Link href="/" className="text-emerald-600 mt-4 inline-block">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛠️ Admin - Manage Product Images</h1>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700">
            ← Back to Site
          </Link>
        </div>

        {/* Simple Instructions */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
          <h3 className="font-bold text-emerald-800 mb-2">📸 How to update product images:</h3>
          <div className="text-sm text-emerald-700 space-y-1">
            <p>1️⃣ <strong>Put your images here:</strong> <code className="bg-white px-2 py-0.5 rounded">frontend-aetherlink/public/images/products/</code></p>
            <p>2️⃣ <strong>Use this URL format:</strong> <code className="bg-white px-2 py-0.5 rounded">/images/products/your-image-name.jpg</code></p>
            <p>3️⃣ <strong>Click "Edit Image" below and paste the URL</strong></p>
            <p className="text-xs mt-2">💡 Example: If you put <strong>satellite.jpg</strong> in the folder, use URL <strong>/images/products/satellite.jpg</strong></p>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Current Image */}
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-emerald-600 font-bold">${product.price}</span>
                      <span className="text-gray-400 text-sm">{product.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      Current URL: {product.imageUrl}
                    </p>
                  </div>
                  
                  {/* Edit Button */}
                  {editingId !== product.id ? (
                    <button
                      onClick={() => {
                        setEditingId(product.id);
                        setTempImageUrl(product.imageUrl);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition h-fit"
                    >
                      Edit Image
                    </button>
                  ) : (
                    <div className="flex gap-2 h-fit">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Edit Form */}
                {editingId === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Image URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        placeholder="/images/products/your-image.jpg"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => updateImage(product.id, tempImageUrl)}
                        disabled={loading}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Tip: Images go in <strong>public/images/products/</strong> folder
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h4 className="font-bold text-gray-700 mb-3">📁 How to add new images:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Open your project folder: <code className="bg-white px-2 py-0.5 rounded">frontend-aetherlink/public/images/products/</code></p>
            <p>2. Drag and drop your images into this folder</p>
            <p>3. Use this format in the URL field: <code className="bg-white px-2 py-0.5 rounded">/images/products/filename.jpg</code></p>
            <p className="text-xs text-gray-400 mt-2">⚠️ Make sure image names don't have spaces (use hyphens instead: my-image.jpg)</p>
          </div>
        </div>
      </div>
    </div>
  );
}