import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Star, Plus } from 'lucide-react';
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
  const [newProductImages, setNewProductImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop'
  ]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newProductDescription, setNewProductDescription] = useState<string>('প্রিমিয়াম কোয়ালিটি সম্পন্ন প্রোডাক্ট।');

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
        setNewProductImages(prev => [...prev, ...results]);
        triggerSystemNotification(`📸 ${results.length} টি ছবি সফলভাবে লোড হয়েছে!`);
      }).catch(() => {
        triggerSystemNotification('⚠️ কিছু ছবি লোড করতে ব্যর্থ হয়েছে');
      });
    }
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    setNewProductImages(prev => [...prev, newUrlInput.trim()]);
    setNewUrlInput('');
    triggerSystemNotification('🔗 ছবির লিংক যোগ করা হয়েছে!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setNewProductImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    triggerSystemNotification('🗑️ ছবি সরিয়ে ফেলা হয়েছে।');
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setNewProductImages(prev => {
      const updated = [...prev];
      const [item] = updated.splice(indexToPrimary, 1);
      updated.unshift(item);
      return updated;
    });
    triggerSystemNotification('⭐ প্রধান বা প্রাইমারি ছবি আপডেট করা হয়েছে!');
  };

  React.useEffect(() => {
    if (isOpen && categories && categories.length > 0) {
      setNewProductCategory(categories[0]);
    }
  }, [isOpen, categories]);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const mainImg = newProductImages[0] || 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop';
    const newId = `prod-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProd: Product = {
      id: newId,
      name: newProductName,
      banglaName: newProductBanglaName || newProductName,
      price: newProductPrice,
      originalPrice: Math.round(newProductPrice * 1.2),
      image: mainImg,
      images: newProductImages.length > 0 ? newProductImages : [mainImg],
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
    setNewProductImages(['https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop']);
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
                <label className="text-zinc-400 block font-bold">পণ্যের ছবিসমূহ (Product Images) - আপনার ইচ্ছামত আপলোড করুন *</label>
                
                {/* Images Preview Grid */}
                <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  {newProductImages.map((url, index) => (
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
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
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
