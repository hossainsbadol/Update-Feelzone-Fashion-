import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Star, Plus } from 'lucide-react';
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
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [sku, setSku] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readPromises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          if (file.size > 2.0 * 1024 * 1024) {
            triggerSystemNotification(`⚠️ '${file.name}' ছবির সাইজ একটু বড় (সর্বোচ্চ ২.০ মেগাবাইট)`);
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => reject();
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then((results) => {
        setImages(prev => [...prev, ...results]);
        triggerSystemNotification(`📸 ${results.length} টি ছবি সফলভাবে লোড হয়েছে!`);
      }).catch(() => {
        triggerSystemNotification('⚠️ কিছু ছবি লোড করতে ব্যর্থ হয়েছে');
      });
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImages(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
    triggerSystemNotification('🔗 ছবির লিংক যোগ করা হয়েছে!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    triggerSystemNotification('🗑️ ছবি সরিয়ে ফেলা হয়েছে।');
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImages(prev => {
      const updated = [...prev];
      const [item] = updated.splice(indexToPrimary, 1);
      updated.unshift(item);
      return updated;
    });
    triggerSystemNotification('⭐ প্রধান বা প্রাইমারি ছবি আপডেট করা হয়েছে!');
  };

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name || '');
      setBanglaName(product.banglaName || product.name || '');
      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice || Math.round((product.price || 0) * 1.2));
      setStock(product.stock || 0);
      setCategory(product.category || (categories && categories.length > 0 ? categories[0] : ''));
      
      const productImages = product.images && product.images.length > 0 
        ? [...product.images] 
        : (product.image ? [product.image] : []);
      setImages(productImages);
      setSku(product.sku || '');
      setDescription(product.description || 'প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।');
    }
  }, [isOpen, product, categories]);

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !name || !price) return;

    const mainImg = images[0] || 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop';
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id
          ? {
              ...p,
              name,
              banglaName: banglaName || name,
              price,
              originalPrice: originalPrice || Math.round(price * 1.2),
              image: mainImg,
              images: images.length > 0 ? images : [mainImg],
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
                <label className="text-zinc-400 block font-bold">পণ্যের ছবিসমূহ (Product Images) - আপনার ইচ্ছামত আপলোড করুন *</label>
                
                {/* Images Preview Grid */}
                <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border border-zinc-850 bg-zinc-900 overflow-hidden group">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition duration-150 cursor-pointer"
                        title="ছবি সরান"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      {/* Primary / Star badge */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 cursor-pointer shadow-xs transition ${
                          index === 0 
                            ? 'bg-amber-500 text-neutral-950 font-black' 
                            : 'bg-black/70 text-zinc-400 hover:text-white hover:bg-black/90'
                        }`}
                        title={index === 0 ? "প্রধান ছবি" : "প্রধান ছবি হিসেবে সেট করুন"}
                      >
                        <Star className={`w-2.5 h-2.5 ${index === 0 ? 'fill-neutral-950 text-neutral-950' : 'text-zinc-400'}`} />
                        {index === 0 ? 'প্রধান' : 'সেট'}
                      </button>
                    </div>
                  ))}

                  {/* Add Image Button Box as Grid Cell */}
                  <label className="relative aspect-square rounded-lg border-2 border-dashed border-zinc-800 hover:border-teal-500 bg-zinc-900/50 hover:bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition text-zinc-500 hover:text-teal-400 gap-1">
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold text-center">নতুন ছবি</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Direct URL input */}
                <div className="space-y-1">
                  <label className="text-zinc-500 block text-[9px] font-bold uppercase tracking-wider">অথবা সরাসরি যেকোনো ওয়েবসাইটের ছবির লিংক যুক্ত করুন (Add Image URL):</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 p-2 rounded-lg focus:outline-none font-mono text-[11px]"
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-3 bg-zinc-800 hover:bg-teal-600 hover:text-white text-zinc-200 font-bold rounded-lg transition text-[11px] cursor-pointer shrink-0"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
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
