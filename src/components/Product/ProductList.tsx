import React, { useState } from 'react';
import { Product } from '../../types';
import { Plus, Search, Filter, FolderEdit, Trash2, Package, AlertTriangle, BadgeDollarSign, Layers } from 'lucide-react';
import ProductAddModal from './ProductAddModal';
import ProductEditModal from './ProductEditModal';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  triggerSystemNotification: (msg: string) => void;
}

export default function ProductList({
  products,
  setProducts,
  categories,
  triggerSystemNotification,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.banglaName && p.banglaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'Low') {
      matchesStock = p.stock > 0 && p.stock <= 15;
    } else if (stockFilter === 'Out') {
      matchesStock = p.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate quick stats
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="space-y-6">
      {/* Visual Bento Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">সর্বমোট প্রোডাক্ট</span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono leading-none block">{totalProducts} টি</span>
            <span className="text-[10px] text-teal-600 font-bold block">সক্রিয় ইনভেন্টরি পণ্য</span>
          </div>
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">সীমিত স্টক এলার্ট</span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono leading-none block">{lowStock} টি</span>
            <span className="text-[10px] text-amber-500 font-bold block">রি-অর্ডার করা প্রয়োজন</span>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Out of Stock Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">স্টকআউট প্রোডাক্ট</span>
            <span className="text-2xl font-extrabold text-[#f93c65] font-mono leading-none block">{outOfStock} টি</span>
            <span className="text-[10px] text-rose-500 font-bold block">গ্রাহকরা কিনতে পারছে না</span>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-xl text-[#f93c65] shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Valuation Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">স্টক মূল্যমান</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono leading-none block">৳{totalValue.toLocaleString()}</span>
            <span className="text-[10px] text-indigo-650 font-bold block">ইনভেন্টরি অ্যাসেট ভ্যালু</span>
          </div>
          <div className="bg-indigo-50/70 p-3.5 rounded-xl text-indigo-650 shrink-0">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bars: Search, Category, Adding system */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shadow-slate-100/40 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          
          {/* Quick instructions / title heading */}
          <div>
            <h3 className="font-extrabold text-base text-slate-800">পণ্য তালিকা ও ইনভেন্টরি ট্র্যাকিং</h3>
            <p className="text-slate-400 text-xs">খুব সহজেই নতুন প্রোডাক্ট যোগ, তথ্য এডিট এবং স্টক আপডেট করতে পারবেন।</p>
          </div>

          {/* Action button to add product */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all font-sans"
          >
            <Plus className="w-4.5 h-4.5" /> নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100/60">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="নাম বা SKU কোড দিয়ে খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-705 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="All">সকল ক্যাটাগরি</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stock filter status */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-720 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans cursor-pointer"
            >
              <option value="All">স্টক অবস্থা (সকল)</option>
              <option value="Low">সীমিত স্টক (১৫ টির নিচে)</option>
              <option value="Out">স্টকআউট (০ টি)</option>
            </select>
          </div>

          {/* Filter summary display counters */}
          <div className="flex items-center justify-center sm:justify-end text-[11px] font-bold text-slate-450 font-mono px-2">
            ফলাফল: <span className="text-indigo-650 ml-1.5">{filteredProducts.length} টি প্রোডাক্ট</span>
          </div>
        </div>

        {/* Product listing container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-slate-400 font-bold text-xs uppercase tracking-wider font-mono">
                <th className="py-3 px-2">ছবি ও নাম</th>
                <th className="py-3 px-2">SKU</th>
                <th className="py-3 px-2">ক্যাটাগরি</th>
                <th className="py-3 px-2">রিসেইলার প্রাইস</th>
                <th className="py-3 px-2 text-center">স্টক অবস্থা</th>
                <th className="py-3 px-2 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <tr key={p.id} className="border-b border-zinc-100/65 hover:bg-slate-50/50 text-slate-700 font-medium transition-all">
                    <td className="py-3 px-2 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200/50" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs sm:text-sm">{p.banglaName || p.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono font-bold">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3 px-2 text-indigo-650 font-extrabold">{p.category}</td>
                    <td className="py-3 px-2 font-mono font-extrabold text-slate-800">৳{p.price}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        p.stock > 15 ? 'bg-emerald-50 text-emerald-600' 
                        : p.stock > 0 ? 'bg-amber-50 text-amber-600' 
                        : 'bg-rose-50 text-rose-600'
                      }`}>
                        {p.stock > 0 ? `${p.stock} টি স্টকে` : 'আউট অফ স্টক'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => setEditingProduct(p)}
                          title="এডিট করুন"
                          className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <FolderEdit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`আপনি কি নিশ্চিত যে '${p.banglaName || p.name}' প্রোডাক্টটি ডিলিট করতে চান?`)) {
                              setProducts(prev => prev.filter(prod => prod.id !== p.id));
                              triggerSystemNotification(`🗑 '${p.banglaName || p.name}' ডিলিট সফল হয়েছে।`);
                            }
                          }}
                          title="মুছে ফেলুন"
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-bold font-sans">
                     কোন প্রোডাক্ট খুঁজে পাওয়া যায়নি!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modals */}
      <ProductAddModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        products={products}
        setProducts={setProducts}
        triggerSystemNotification={triggerSystemNotification}
        categories={categories}
      />

      <ProductEditModal 
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        setProducts={setProducts}
        triggerSystemNotification={triggerSystemNotification}
        categories={categories}
      />
    </div>
  );
}
