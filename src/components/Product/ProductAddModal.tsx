import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Product } from '../../types';

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  triggerSystemNotification: (msg: string) => void;
  categories: string[];
}

export default function ProductAddModal({
  isOpen,
  onClose,
  products,
  setProducts,
  triggerSystemNotification,
  categories,
}: ProductAddModalProps) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductBanglaName, setNewProductBanglaName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number>(1000);
  const [newProductStock, setNewProductStock] = useState<number>(50);
  const [newProductCategory, setNewProductCategory] = useState<string>('');
  const [newProductImage, setNewProductImage] = useState<string>('https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop');

  React.useEffect(() => {
    if (isOpen && categories && categories.length > 0) {
      setNewProductCategory(categories[0]);
    }
  }, [isOpen, categories]);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const newProd: Product = {
      id: `prod-${products.length + 1}`,
      name: newProductName,
      banglaName: newProductBanglaName || newProductName,
      price: newProductPrice,
      originalPrice: Math.round(newProductPrice * 1.2),
      image: newProductImage,
      category: newProductCategory,
      stock: newProductStock,
      sku: `${newProductCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      description: 'প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।',
      ratings: 5.0,
      reviewsCount: 1
    };

    setProducts(prev => [newProd, ...prev]);
    onClose();
    triggerSystemNotification(`📦 নতুন প্রডাক্ট '${newProductName}' সুন্দরভাবে তালিকায় যুক্ত হয়েছে!`);
    
    // Clear Form
    setNewProductName('');
    setNewProductBanglaName('');
    setNewProductPrice(1000);
    setNewProductStock(50);
    setNewProductImage('https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6 relative"
            id="add-product-modal-container"
          >
            <button 
              onClick={onClose}
              id="close-add-product-modal-btn"
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white" id="add-product-modal-title">তালিকায় নতুন প্রোডাক্ট সংযুক্ত করুন</h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের নাম (ইংরেজিতে) *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Premium Organic Honey"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের বাংলা নাম (গ্রাহকের জন্য) *</label>
                <input 
                  type="text" 
                  placeholder="খাঁটি সুন্দরবনের মধু"
                  value={newProductBanglaName}
                  onChange={(e) => setNewProductBanglaName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">পণ্যের মূল্য (টাকা) *</label>
                  <input 
                    type="number" 
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">স্টক পরিমাণ *</label>
                  <input 
                    type="number" 
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">ক্যাটাগরি *</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-teal-400 p-2.5 rounded-lg focus:outline-none font-bold font-sans"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের ছবির লিংক (Image URL)</label>
                <input 
                  type="text" 
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <button 
                type="submit"
                id="submit-product-add"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
              >
                ইনভেন্টরি তালিকায় যোগ করুন
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
