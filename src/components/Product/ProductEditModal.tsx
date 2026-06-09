import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Product } from '../../types';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  triggerSystemNotification: (msg: string) => void;
  categories: string[];
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  setProducts,
  triggerSystemNotification,
  categories,
}: ProductEditModalProps) {
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        triggerSystemNotification('⚠️ ছবির সাইজ একটু বড় (সর্বোচ্চ ১.৫ মেগাবাইট অনুমোদনযোগ্য)');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        triggerSystemNotification('📸 পণ্যের ছবি সফলভাবে লোড হয়েছে!');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name || '');
      setBanglaName(product.banglaName || product.name || '');
      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice || Math.round((product.price || 0) * 1.2));
      setStock(product.stock || 0);
      setCategory(product.category || (categories && categories.length > 0 ? categories[0] : ''));
      setImage(product.image || '');
      setSku(product.sku || '');
      setDescription(product.description || 'প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।');
    }
  }, [isOpen, product, categories]);

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !name || !price) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === product.id
          ? {
              ...p,
              name,
              banglaName: banglaName || name,
              price,
              originalPrice: originalPrice || Math.round(price * 1.2),
              image,
              category,
              stock,
              sku,
              description,
            }
          : p
      )
    );

    triggerSystemNotification(`📦 প্রডাক্ট '${name}' এর তথ্য সফলভাবে আপডেট করা হয়েছে!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto"
            id="edit-product-modal-container"
          >
            <button 
              onClick={onClose}
              id="close-edit-product-modal-btn"
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-white" id="edit-product-modal-title">প্রোডাক্ট তথ্য সংশোধন করুন</h3>

            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের নাম (ইংরেজিতে) *</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের বাংলা নাম *</label>
                <input 
                  type="text" 
                  required
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">রিসেইলার প্রাইস (৳) *</label>
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">বাজার বা পূর্বের মূল্য (৳)</label>
                  <input 
                    type="number" 
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">স্টক পরিমাণ *</label>
                  <input 
                    type="number" 
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">SKU কোড</label>
                  <input 
                    type="text" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">ক্যাটাগরি *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                    {image ? (
                      <img 
                        src={image} 
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
                      <span className="text-white text-[11px] font-bold">ছবি সংশোধন করুন</span>
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
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none font-mono text-[11px]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block font-bold">পণ্যের বিবরণ (Description)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none font-sans"
                />
              </div>

              <button 
                type="submit"
                id="submit-product-edit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
              >
                পণ্য তথ্য সংরক্ষণ করুন
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
