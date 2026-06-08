import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShieldAlert } from 'lucide-react';
import { Product } from '../../types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: string | null;
  products: Product[];
  allCategories: string[];
  onDelete: (catName: string, fallbackCat: string) => void;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryToDelete,
  products,
  allCategories,
  onDelete,
}: DeleteCategoryModalProps) {
  const [fallbackCat, setFallbackCat] = useState('অন্যান্য');
  const catProducts = categoryToDelete ? products.filter(p => p.category === categoryToDelete) : [];

  useEffect(() => {
    if (isOpen) {
      // Find a default fallback category which is not the one being deleted
      const available = allCategories.filter(c => c !== categoryToDelete);
      if (available.length > 0) {
        if (available.includes('অন্যান্য')) {
          setFallbackCat('অন্যান্য');
        } else {
          setFallbackCat(available[0]);
        }
      } else {
        setFallbackCat('অন্যান্য');
      }
    }
  }, [categoryToDelete, isOpen, allCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToDelete) return;
    onDelete(categoryToDelete, fallbackCat);
    onClose();
  };

  const otherCategories = allCategories.filter(c => c !== categoryToDelete);

  return (
    <AnimatePresence>
      {isOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-5 relative font-sans text-xs"
            id="delete-category-modal-container"
          >
            <button 
              onClick={onClose}
              id="close-delete-cat-modal"
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-3 items-center">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded uppercase">সতর্ক বার্তা</span>
                <h3 className="text-base font-extrabold text-white mt-1" id="delete-cat-title">ক্যাটাগরি মুছে ফেলতে চান?</h3>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
              <p className="text-zinc-300">
                আপনি কি নিশ্চিতভাবে <span className="text-rose-400 font-extrabold underline">{categoryToDelete}</span> ক্যাটাগরি ডিলিট করতে চান?
              </p>
              {catProducts.length > 0 ? (
                <p className="text-zinc-400 text-[11px]">
                  📊 এই ক্যাটাগরিতে মোট <span className="text-teal-400 font-bold">{catProducts.length} টি পণ্য</span> রয়েছে। ডিলিট করার পর পণ্যগুলো স্থানান্তরিত হবে।
                </p>
              ) : (
                <p className="text-zinc-500 italic text-[11px]">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই।</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {catProducts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-zinc-400 font-bold block">পণ্যসমূহ স্থানান্তরের জন্য বিকল্প ক্যাটাগরি *</label>
                  <select 
                    value={fallbackCat}
                    onChange={(e) => setFallbackCat(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-teal-400 font-bold p-2.5 rounded-lg focus:outline-none"
                  >
                    {otherCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {!otherCategories.includes('অন্যান্য') && (
                      <option value="অন্যান্য">অন্যান্য (নতুন ক্যাটাগরি)</option>
                    )}
                  </select>
                  <p className="text-[10px] text-zinc-500">পছন্দকৃত ক্যাটাগরিটিতে পণ্যের স্টক ও বিবরণ স্বাভাবিক থাকবে।</p>
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
                  id="submit-category-delete"
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl transition cursor-pointer flex justify-center items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> নিশ্চিতভাবে ডিলিট করুন
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
