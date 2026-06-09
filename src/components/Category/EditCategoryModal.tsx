import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Upload } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: string | null;
  categoryImage: string;
  allCategories: string[];
  onRename: (oldName: string, newName: string, newImage: string) => void;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  categoryImage,
  allCategories,
  onRename,
}: EditCategoryModalProps) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatImg, setNewCatImg] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setNewCatName(categoryToEdit);
      const img = categoryImage || '';
      setNewCatImg(img);
      if (img.startsWith('data:')) {
        setImageSourceType('upload');
      } else if (img) {
        setImageSourceType('url');
      } else {
        setImageSourceType('upload');
      }
      setValidationError(null);
    }
  }, [categoryToEdit, categoryImage, isOpen]);

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setValidationError('ছবিটির সাইজ ২ মেগাবাইট (2MB) এর বেশি হতে পারবে না!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setNewCatImg(e.target.result);
        setValidationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setValidationError('ক্যাটাগরির নাম খালি হতে পারে না!');
      return;
    }

    if (
      trimmedName.toLowerCase() === categoryToEdit.toLowerCase() &&
      newCatImg.trim() === categoryImage
    ) {
      onClose(); // No changes made
      return;
    }

    if (
      allCategories.some(
        c =>
          c.toLowerCase() === trimmedName.toLowerCase() &&
          c.toLowerCase() !== categoryToEdit.toLowerCase()
      )
    ) {
      setValidationError('নতুন নামটি ইতিমধ্যেই অন্য একটি ক্যাটাগরিতে ব্যবহৃত হচ্ছে!');
      return;
    }

    onRename(categoryToEdit, trimmedName, newCatImg.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && categoryToEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-5 relative font-sans text-xs"
            id="edit-category-modal-container"
          >
            <button 
              onClick={onClose}
              id="close-edit-cat-modal"
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded">সংশোধন পোর্টাল</span>
              <h3 className="text-base font-extrabold text-white mt-1.5" id="edit-cat-title">ক্যাটাগরি নাম পরিবর্তন করুন</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-zinc-400 block font-bold">বর্তমান নাম</label>
                <input 
                  type="text" 
                  disabled
                  value={categoryToEdit}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 p-2.5 rounded-lg focus:outline-none cursor-not-allowed italic font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 block font-bold">নতুন কাঙ্ক্ষিত নাম *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="যেমন: ইলেকট্রনিক্স সামগ্রী"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-400 block font-bold">ক্যাটাগরি ছবি</label>
                  <div className="flex gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setImageSourceType('upload');
                        if (!newCatImg.startsWith('data:')) setNewCatImg('');
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
                        if (newCatImg.startsWith('data:')) setNewCatImg('');
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
                        : newCatImg && newCatImg.startsWith('data:')
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
                    value={newCatImg}
                    onChange={(e) => setNewCatImg(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                )}
              </div>

              {newCatImg && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 flex-shrink-0 bg-zinc-900 relative">
                    <img 
                      src={newCatImg} 
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
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCatImg('')}
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
                  বাতিল করুন
                </button>
                <button 
                  type="submit"
                  id="submit-category-rename"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl transition cursor-pointer flex justify-center items-center gap-1"
                >
                  <Save className="w-4 h-4" /> সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
