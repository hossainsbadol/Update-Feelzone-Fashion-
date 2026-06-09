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
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(15);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.banglaName && p.banglaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'Low') {
      matchesStock = p.stock > 0 && p.stock <= lowStockThreshold;
    } else if (stockFilter === 'Out') {
      matchesStock = p.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate quick stats
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="space-y-6">
      {/* Visual Bento Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products Card */}
        <div 
          onClick={() => {
            setStockFilter('All');
            setSelectedCategory('All');
            setSearchQuery('');
            triggerSystemNotification('📋 ফিল্টার রিসেট করা হয়েছে: সকল প্রোডাক্ট প্রদর্শিত হচ্ছে।');
          }}
          className="bg-white border border-slate-100 hover:border-indigo-350 cursor-pointer hover:shadow-md hover:shadow-indigo-50/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between"
          id="stat-all-products"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">সর্বমোট প্রোডাক্ট</span>
            <span className="text-2xl font-extrabold text-indigo-650 font-mono leading-none block">{totalProducts} টি</span>
            <span className="text-[10px] text-teal-600 font-bold block">সক্রিয় ইনভেন্টরি পণ্য</span>
          </div>
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Card */}
        <div 
          onClick={() => {
            setStockFilter('Low');
            triggerSystemNotification('⚠️ ফিল্টার সেট করা হয়েছে: সীমিত স্টক বিশিষ্ট প্রোডাক্টগুলো দেখানো হচ্ছে।');
          }}
          className="bg-white border border-slate-150 hover:border-amber-400 cursor-pointer hover:shadow-md hover:shadow-amber-50/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between"
          id="stat-low-stock"
        >
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
        <div 
          onClick={() => {
            setStockFilter('Out');
            triggerSystemNotification('🚨 ফিল্টার সেট করা হয়েছে: আউট অফ স্টক প্রোডাক্টগুলো দেখানো হচ্ছে।');
          }}
          className="bg-white border border-slate-100 hover:border-rose-450 cursor-pointer hover:shadow-md hover:shadow-rose-50/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between"
          id="stat-out-of-stock"
        >
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
        <div 
          onClick={() => {
            setStockFilter('All');
            triggerSystemNotification(`💼 মোট ইনভেন্টরি অ্যাসেট মূল্যমান: ৳${totalValue.toLocaleString()} (মোট প্রোডাক্ট স্টকের বাজার মূল্য)`);
          }}
          className="bg-white border border-slate-100 hover:border-indigo-350 cursor-pointer hover:shadow-md hover:shadow-indigo-50/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] rounded-2xl p-5 shadow-sm shadow-slate-100/40 flex items-center justify-between"
          id="stat-valuation"
        >
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
              <option value="Low">সীমিত স্টক ({lowStockThreshold} টির নিচে)</option>
              <option value="Out">স্টকআউট (০ টি)</option>
            </select>
          </div>

          {/* Stock Warning Threshold Selector */}
          <div className="relative flex items-center justify-between bg-white border border-slate-200 rounded-lg py-1 px-3 select-none">
            <div className="flex items-center gap-1.5 min-w-[130px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-550 truncate">স্টক এলার্ট লিমিট:</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => {
                  setLowStockThreshold(prev => Math.max(1, prev - 1));
                  triggerSystemNotification(`📉 স্টক সতর্কবার্তার থ্রেশহোল্ড ${Math.max(1, lowStockThreshold - 1)} টি করা হলো`);
                }}
                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
              >
                -
              </button>
              <span className="text-xs font-mono font-extrabold w-5 text-center text-indigo-650">{lowStockThreshold}</span>
              <button 
                onClick={() => {
                  setLowStockThreshold(prev => Math.min(100, prev + 1));
                  triggerSystemNotification(`📈 স্টক সতর্কবার্তার থ্রেশহোল্ড ${Math.min(100, lowStockThreshold + 1)} টি করা হলো`);
                }}
                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs"
              >
                +
              </button>
            </div>
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
                filteredProducts.map(p => {
                  const isLowStock = p.stock > 0 && p.stock <= lowStockThreshold;
                  const isOutOfStock = p.stock === 0;
                  
                  return (
                    <tr 
                      key={p.id} 
                      className={`border-b transition-all font-medium ${
                        isOutOfStock 
                          ? 'border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 text-slate-700' 
                          : isLowStock 
                            ? 'border-amber-100 bg-amber-50/25 hover:bg-amber-50/35 text-slate-700' 
                            : 'border-zinc-100/65 hover:bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-2 flex items-center gap-3">
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200/50" referrerPolicy="no-referrer" />
                          {isOutOfStock && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 animate-pulse shadow-xs" title="স্টকআউট!">
                              <AlertTriangle className="w-2.5 h-2.5" />
                            </span>
                          )}
                          {isLowStock && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 animate-bounce shadow-xs" title="সীমিত স্টক!">
                              <AlertTriangle className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 block text-xs sm:text-sm">{p.banglaName || p.name}</span>
                            {isOutOfStock && (
                              <span className="bg-rose-50 text-[#f93c65] text-[9.5px] px-1.5 py-0.5 rounded-sm font-sans font-black flex items-center gap-0.5 border border-rose-100 shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5" /> স্টক আউট!
                              </span>
                            )}
                            {isLowStock && (
                              <span className="bg-amber-50 text-amber-700 text-[9.5px] px-1.5 py-0.5 rounded-sm font-sans font-bold flex items-center gap-0.5 border border-amber-200 shrink-0 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" /> সীমিত স্টক
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono font-bold">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-2 text-indigo-650 font-extrabold">{p.category}</td>
                      <td className="py-3 px-2 font-mono font-extrabold text-slate-800">৳{p.price}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                          p.stock > lowStockThreshold ? 'bg-emerald-50 text-emerald-600' 
                          : p.stock > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
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
                        {deleteConfirmId === p.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg">
                            <button
                              onClick={() => {
                                setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                triggerSystemNotification(`🗑 '${p.banglaName || p.name}' ডিলিট সফল হয়েছে।`);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 text-[10px] bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition cursor-pointer"
                              id={`confirm-delete-yes-${p.id}`}
                            >
                              হ্যাঁ
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-[10px] bg-white text-slate-550 border border-slate-200 rounded font-bold hover:bg-slate-50 transition cursor-pointer"
                              id={`confirm-delete-no-${p.id}`}
                            >
                              না
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="মুছে ফেলুন"
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            id={`delete-btn-${p.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
