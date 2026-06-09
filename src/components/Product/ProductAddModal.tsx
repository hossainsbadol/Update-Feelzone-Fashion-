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
  const [newProductDescription, setNewProductDescription] = useState<string>('প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        triggerSystemNotification('⚠️ ছবির সাইজ একটু বড় (সর্বোচ্চ ১.৫ মেগাবাইট অনুমোদনযোগ্য)');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result as string);
        triggerSystemNotification('📸 পণ্যের ছবি সফলভাবে লোড হয়েছে!');
      };
      reader.readAsDataURL(file);
    }
  };

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
      description: newProductDescription,
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
    setNewProductDescription('প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto"
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

              <div className="space-y-2">
                <label className="text-zinc-400 block font-bold">পণ্যের ছবি (Product Image) *</label>
                <div className="flex gap-4 items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <div className="w-16 h-16 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                    {newProductImage ? (
                      <img 
                        src={newProductImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-bold">ছবি নাই</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-zinc-750 hover:border-teal-500 bg-zinc-900 hover:bg-zinc-850 text-center cursor-pointer transition">
                      <span className="text-white text-[11px] font-bold">ছবি আপলোড করুন</span>
                      <span className="text-[9px] text-zinc-500">পিসি/ফোন থেকে ফাইল সিলেক্ট করুন</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 block text-[10px] font-semibold">অথবা সরাসরি ইমেজের লিংক দিন (Image URL):</label>
                  <input 
                    type="text" 
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none font-mono text-[11px]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের বিবরণ (Description)</label>
                <textarea 
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none font-sans"
                  placeholder="পণ্যের গুণাবলী, আকার ও ডেলিভারি বা অন্য যেকোনো বিষয় লিখুন..."
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
