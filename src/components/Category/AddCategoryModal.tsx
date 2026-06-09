import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Tag, ImageIcon, Upload } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCategories: string[];
  onAdd: (name: string, imageUrl: string) => void;
}

const CATEGORY_PRESETS = [
  { name: 'Electronic Accessories', icon: '⚡', img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80' },
  { name: 'Mother & Baby', icon: '🍼', img: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=400&q=80' },
  { name: 'Sports & Outdoors', icon: '⚽', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80' },
  { name: 'Organic Fertilizer', icon: '🌱', img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=400&q=80' },
  { name: 'Gaming Products', icon: '🎮', img: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&q=80' },
  { name: 'Fashion & Apparel', icon: '👕', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80' },
  { name: 'Watch & Gadgets', icon: '⌚', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80' },
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  allCategories,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setValidationError('ছবিটির সাইজ ২ মেগাবাইট (2MB) এর বেশি হতে পারবে না!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setImageUrl(e.target.result);
        setValidationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('ক্যাটাগরির নাম খালি হতে পারে না!');
      return;
    }

    if (allCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setValidationError('এই ক্যাটাগরিটি ইতিমধ্যে সংরক্ষিত তালিকায় আছে!');
      return;
    }

    const defaultImg = imageUrl.trim() || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60';
    onAdd(trimmedName, defaultImg);
    setName('');
    setImageUrl('');
    setValidationError(null);
    onClose();
  };

  const handleSelectPreset = (presetName: string, presetImg: string) => {
    setName(presetName);
    setImageUrl(presetImg);
    setImageSourceType('url');
    setValidationError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 space-y-5 relative font-sans text-xs"
            id="add-category-modal-container"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded">নতুন ক্যাটাগরি</span>
              <h3 className="text-base font-extrabold text-white mt-1.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-400" /> নতুন ক্যাটাগরি তৈরি করুন
              </h3>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-zinc-500 block font-bold">জনপ্রিয় ডেমো ক্যাটাগরি (সহজে সিলেক্ট করুন):</span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_PRESETS.map((p) => {
                  const isMatch = name === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p.name, p.img)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-xs transition flex items-center gap-1 cursor-pointer ${
                        isMatch 
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-bold' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 block font-bold">ক্যাটাগরি নাম *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="যেমন: Electronic Accessories"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setValidationError(null);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-zinc-400 block font-bold">ক্যাটাগরি ছবি *</label>
                    <div className="flex gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setImageSourceType('upload');
                          if (!imageUrl.startsWith('data:')) setImageUrl('');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                          imageSourceType === 'upload'
                            ? 'bg-teal-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        আপলোড
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageSourceType('url');
                          if (imageUrl.startsWith('data:')) setImageUrl('');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                          imageSourceType === 'url'
                            ? 'bg-teal-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        অনলাইন লিঙ্ক
                      </button>
                    </div>
                  </div>

                  {imageSourceType === 'upload' ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFile(file);
                      }}
                      className={`border border-dashed rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition text-center ${
                        isDragging 
                          ? 'border-teal-500 bg-teal-500/10' 
                          : imageUrl && imageUrl.startsWith('data:')
                            ? 'border-emerald-500 bg-zinc-950'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                        }}
                        accept="image/*" 
                        className="hidden" 
                      />
                      <Upload className="w-4 h-4 text-zinc-500" />
                      <div className="space-y-0.5">
                        <p className="text-zinc-300 font-bold text-[10px]">এখানে ক্লিক করুন বা ছবি ড্রপ করুন</p>
                        <p className="text-zinc-500 text-[8px]">JPG, PNG বা WEBP (সর্বোচ্চ ২MB)</p>
                      </div>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-white p-2.5 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                    />
                  )}
                </div>
              </div>

              {imageUrl && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-900 relative">
                    <img 
                      src={imageUrl} 
                      alt="Category preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide block">ক্যাটাগরি ছবি প্রিভিউ</span>
                    <span className="text-teal-400 font-bold block truncate max-w-[280px]">{name || 'অজ্ঞাত ক্যাটাগরি'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-bold p-1 bg-rose-500/10 rounded cursor-pointer transition shrink-0"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              )}

              {validationError && (
                <div className="text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 text-[11px]">
                  ⚠️ {validationError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl transition cursor-pointer flex justify-center items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> ক্যাটাগরি যোগ করুন
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
