import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: string | null;
  allCategories: string[];
  onRename: (oldName: string, newName: string) => void;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  allCategories,
  onRename,
}: EditCategoryModalProps) {
  const [newCatName, setNewCatName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setNewCatName(categoryToEdit);
      setValidationError(null);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    const trimmed = newCatName.trim();
    if (!trimmed) {
      setValidationError('ক্যাটাগরির নাম খালি হতে পারে না!');
      return;
    }

    if (trimmed.toLowerCase() === categoryToEdit.toLowerCase()) {
      onClose(); // No changes made
      return;
    }

    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== categoryToEdit.toLowerCase())) {
      setValidationError('নতুন নামটি ইতিমধ্যেই অন্য একটি ক্যাটাগরিতে ব্যবহৃত হচ্ছে!');
      return;
    }

    onRename(categoryToEdit, trimmed);
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
