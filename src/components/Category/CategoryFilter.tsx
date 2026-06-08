import { Grid3X3 } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
      <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2" id="category-filter-header">
        <Grid3X3 className="w-5 h-5 text-teal-600" /> ক্যাটাগরি সমূহ
      </h3>
      <div className="flex flex-col gap-1.5">
        {categories.map(cat => (
          <button 
            key={cat}
            id={`cat-filter-btn-${cat.replace(/\s/g, '-')}`}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full text-left py-2 px-4 rounded-full text-sm transition font-medium flex justify-between items-center cursor-pointer ${
              selectedCategory === cat 
                ? 'bg-teal-600 text-white font-bold shadow-sm shadow-teal-600/20' 
                : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-750'
            }`}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
