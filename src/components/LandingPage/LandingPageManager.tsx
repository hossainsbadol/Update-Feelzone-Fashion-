import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Eye, Plus, Trash2, Edit3, ArrowLeft, Check, ShoppingCart, 
  Smartphone, Monitor, Play, FileText, Package, CheckCircle, ExternalLink,
  Tag, Palette, Film, ShieldCheck, Star, AlertTriangle, Search
} from 'lucide-react';
import { Product, LandingPage, LandingPageTheme } from '../../types';

interface LandingPageManagerProps {
  products: Product[];
  landingPages: LandingPage[];
  setLandingPages: React.Dispatch<React.SetStateAction<LandingPage[]>>;
  setActiveLandingId: (id: string | null) => void;
  triggerSystemNotification: (message: string) => void;
}

export default function LandingPageManager({
  products,
  landingPages,
  setLandingPages,
  setActiveLandingId,
  triggerSystemNotification
}: LandingPageManagerProps) {
  // Navigation states: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  // Form Field States
  const [formData, setFormData] = useState<{
    title: string;
    productId: string;
    theme: LandingPageTheme;
    headline: string;
    subheadline: string;
    badgeText: string;
    guaranteeText: string;
    videoUrl: string;
    accentColor: string;
  }>({
    title: '',
    productId: products[0]?.id || '',
    theme: 'Warm Amber',
    headline: '',
    subheadline: '',
    badgeText: 'সীমিত অফার!',
    guaranteeText: '৭ দিনের সহজ রিটার্ন পলিসি এবং চেক করে ক্যাশ-অন ডেলিভারিতে ক্রয়ের নিশ্চয়তা।',
    videoUrl: '',
    accentColor: '#f59e0b'
  });

  const [formSearchProduct, setFormSearchProduct] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter products for connect selector
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(formSearchProduct.toLowerCase()) || 
      (p.banglaName && p.banglaName.toLowerCase().includes(formSearchProduct.toLowerCase())) ||
      p.category.toLowerCase().includes(formSearchProduct.toLowerCase())
    );
  }, [products, formSearchProduct]);

  // Selected product object
  const selectedProductObj = useMemo(() => {
    return products.find(p => p.id === formData.productId) || products[0];
  }, [products, formData.productId]);

  // Enter creation form
  const handleOpenCreateForm = () => {
    const defaultProduct = products[0];
    setFormData({
      title: '',
      productId: defaultProduct?.id || '',
      theme: 'Warm Amber',
      headline: defaultProduct ? `প্রিমিয়াম কোয়ালিটি ${defaultProduct.banglaName || defaultProduct.name} - সেরা অফার!` : 'আমাদের প্রিমিয়াম কোয়ালিটি বিশেষ পণ্য সংগ্রহ',
      subheadline: defaultProduct ? `সেরা ডিজাইনে প্রস্তুতকৃত এবং দৈনন্দিন জীবনে ব্যবহারে অত্যন্ত আরামদায়ক ও আর্কষনীয়। আজই অর্ডার করুন ফ্রি ডেলিভারিতে!` : 'আপনার দৈনন্দিন জীবনের পরিপূরক অনন্য পণ্য নিয়ে এলাম বিশেষ শীতকালীন ছাড়ে।',
      badgeText: 'বেস্ট সেলার!',
      guaranteeText: 'পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে ক্যাশ-অন ডেলিভারিতে মূল্য পরিশোধ করুন।',
      videoUrl: '',
      accentColor: '#f59e0b'
    });
    setFormSearchProduct('');
    setActiveFormId(null);
    setViewMode('form');
  };

  // Enter editing mode
  const handleOpenEditForm = (lp: LandingPage) => {
    setFormData({
      title: lp.title,
      productId: lp.productId,
      theme: lp.theme,
      headline: lp.headline,
      subheadline: lp.subheadline,
      badgeText: lp.badgeText,
      guaranteeText: lp.guaranteeText,
      videoUrl: lp.videoUrl || '',
      accentColor: lp.accentColor || '#f59e0b'
    });
    setFormSearchProduct('');
    setActiveFormId(lp.id);
    setViewMode('form');
  };

  // Handle selected product changed
  const handleSelectProduct = (p: Product) => {
    setFormData(prev => ({
      ...prev,
      productId: p.id,
      title: p.banglaName || p.name,
      headline: `প্রিমিয়াম কোয়ালিটি ${p.banglaName || p.name} - বিশেষ মূল্যছাড়!`,
      subheadline: `আমাদের প্রিমিয়াম সংগ্রহের এই পণ্যটি আপনার ফ্যাশন এবং প্রাত্যহিক প্রয়োজনের নিখুঁত সমাধান করবে। আজই অর্ডার করে লাভ করুন স্পেশাল ক্যাশব্যাক।`
    }));
    setFormSearchProduct('');
    setIsDropdownOpen(false);
    triggerSystemNotification(`🎯 ল্যান্ডিং পেজের সাথে "${p.banglaName || p.name}" প্রোডাক্ট যুক্ত করা হয়েছে`);
  };

  // Handle Theme circle selections
  const handleSelectTheme = (theme: LandingPageTheme) => {
    let accent = '#f59e0b';
    if (theme === 'Deep Emerald') accent = '#059669';
    else if (theme === 'Cosmic Blue') accent = '#2563eb';
    else if (theme === 'Sleek Charcoal') accent = '#1f2937';
    else if (theme === 'Bold Red') accent = '#dc2626';

    setFormData(prev => ({
      ...prev,
      theme,
      accentColor: accent
    }));
  };

  // Save / Update logic
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('সঠিকভাবে ল্যান্ডিং পেজের টাইটেল লিখুন!');
      return;
    }

    if (activeFormId) {
      // Editing Mode
      const updatedLp: LandingPage = {
        id: activeFormId,
        productId: formData.productId,
        theme: formData.theme,
        title: formData.title,
        headline: formData.headline,
        subheadline: formData.subheadline,
        badgeText: formData.badgeText,
        videoUrl: formData.videoUrl,
        guaranteeText: formData.guaranteeText,
        accentColor: formData.accentColor
      };

      setLandingPages(prev => prev.map(lp => lp.id === activeFormId ? updatedLp : lp));
      triggerSystemNotification(`✨ "${formData.title}" ল্যান্ডিং পেজটি কাস্টম আপডেট করা হয়েছে!`);
    } else {
      // Creating Mode
      const newLpId = `lp-${Date.now()}`;
      const newLp: LandingPage = {
        id: newLpId,
        productId: formData.productId,
        theme: formData.theme,
        title: formData.title,
        headline: formData.headline,
        subheadline: formData.subheadline,
        badgeText: formData.badgeText,
        videoUrl: formData.videoUrl,
        guaranteeText: formData.guaranteeText,
        accentColor: formData.accentColor
      };

      setLandingPages(prev => [...prev, newLp]);
      triggerSystemNotification(`🔥 নতুন চমৎকার ল্যান্ডিং পেজ "${formData.title}" সফলভাবে তৈরি হয়েছে!`);
    }

    setViewMode('list');
  };

  // Delete handler
  const handleDeleteLp = (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${name}" ল্যান্ডিং পেজটি ডিলিট করতে চান?`)) {
      setLandingPages(prev => prev.filter(lp => lp.id !== id));
      triggerSystemNotification(`🗑️ ল্যান্ডিং পেজ "${name}" সফলভাবে ডিলিট করা হয়েছে!`);
    }
  };

  // Generate simulated theme-based colors for Mock Mobile View Preview
  const mockStyles = useMemo(() => {
    let bg = 'bg-stone-50';
    let text = 'text-stone-900';
    let pCard = 'bg-white border-zinc-100';
    let badge = 'bg-amber-100 text-amber-800';
    let btn = 'bg-amber-500 hover:bg-amber-600 text-stone-950';

    if (formData.theme === 'Deep Emerald') {
      bg = 'bg-emerald-50';
      text = 'text-emerald-950';
      pCard = 'bg-white border-emerald-100/50';
      badge = 'bg-emerald-100 text-emerald-800';
      btn = 'bg-emerald-600 text-white';
    } else if (formData.theme === 'Cosmic Blue') {
      bg = 'bg-slate-900';
      text = 'text-slate-100';
      pCard = 'bg-slate-800 border-slate-750';
      badge = 'bg-blue-900/50 text-blue-300';
      btn = 'bg-blue-600 text-white';
    } else if (formData.theme === 'Sleek Charcoal') {
      bg = 'bg-zinc-100';
      text = 'text-zinc-950';
      pCard = 'bg-white border-zinc-200';
      badge = 'bg-zinc-200 text-zinc-800';
      btn = 'bg-zinc-900 text-white';
    } else if (formData.theme === 'Bold Red') {
      bg = 'bg-red-50';
      text = 'text-red-950';
      pCard = 'bg-white border-red-100/50';
      badge = 'bg-red-100 text-red-850';
      btn = 'bg-red-650 text-white';
    }

    return { bg, text, pCard, badge, btn };
  }, [formData.theme]);

  return (
    <div className="space-y-6">
      {/* Tab Banner Heading info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>প্রফেশনাল ল্যান্ডিং পেজ ক্রিয়েটর</span>
          </h2>
          <p className="text-xs text-zinc-400">প্রতিটি স্পেশাল প্রোডাক্ট বিক্রয়ের জন্য রেডি ক্যাম্পেইন পেজ নিয়ন্ত্রণ কেন্দ্র</p>
        </div>

        {viewMode === 'list' ? (
          <button
            onClick={handleOpenCreateForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 transition-all active:scale-95 select-none"
            id="btn-create-lp"
          >
            <Plus className="w-4 h-4" /> নতুন ল্যান্ডিং পেজ তৈরি করুন
          </button>
        ) : (
          <button
            onClick={() => setViewMode('list')}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> তালিকায় ফিরে যান
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {landingPages.length > 0 ? (
              landingPages.map(lp => {
                const associatedProduct = products.find(p => p.id === lp.productId);
                
                return (
                  <div 
                    key={lp.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-750 transition duration-300 group shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Card upper image or theme placeholder */}
                      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center relative">
                        <div className="flex items-center gap-2.5">
                          {associatedProduct ? (
                            <img 
                              src={associatedProduct.image} 
                              alt={associatedProduct.name} 
                              className="w-11 h-11 object-cover rounded-lg border border-zinc-850"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-zinc-600" />
                            </div>
                          )}
                          <div className="max-w-[150px]">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 block font-bold">ক্যাম্পেইন পেজ</span>
                            <span className="font-extrabold text-white text-xs block truncate" title={lp.title}>{lp.title}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black uppercase font-mono py-0.5 px-2 rounded-full h-fit shadow-xs ${
                          lp.theme === 'Warm Amber' ? 'bg-amber-900/30 text-amber-400 border border-amber-900/40' :
                          lp.theme === 'Deep Emerald' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/40' :
                          lp.theme === 'Cosmic Blue' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/40' :
                          lp.theme === 'Sleek Charcoal' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' :
                          'bg-red-900/30 text-red-400 border border-red-900/40'
                        }`}>
                          {lp.theme}
                        </span>
                      </div>

                      {/* Headline body info */}
                      <div className="p-5 space-y-3.5">
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">১ম স্ক্রিন হেডলাইন:</span>
                          <p className="text-zinc-300 font-bold text-xs leading-relaxed line-clamp-3">{lp.headline}</p>
                        </div>

                        {associatedProduct && (
                          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850 flex justify-between items-center text-[11px]">
                            <span className="text-zinc-500 font-bold">সংযুক্ত ক্যাটালগ:</span>
                            <span className="font-mono text-zinc-300 font-black">
                              ৳{associatedProduct.price.toLocaleString()} ({associatedProduct.banglaName || associatedProduct.name})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 pb-5 pt-3 border-t border-zinc-850 bg-zinc-900/45 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleOpenEditForm(lp)}
                        className="bg-zinc-800 hover:bg-zinc-750 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer select-none border border-zinc-750"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> এডিট
                      </button>

                      <button
                        onClick={() => {
                          setActiveLandingId(lp.id);
                          triggerSystemNotification(`👀 ${lp.title} ল্যান্ডিং পেজ লাইভ ডেমো ভিউ খোলা হয়েছে`);
                        }}
                        className="bg-teal-650 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer select-none shadow-sm shadow-teal-900/10"
                        title="কাস্টমার লাইভ ভিউ প্রিভিউ"
                      >
                        <Eye className="w-3.5 h-3.5" /> ভিউ
                      </button>

                      <button
                        onClick={() => handleDeleteLp(lp.id, lp.title)}
                        className="bg-rose-950/40 hover:bg-rose-900/45 text-rose-400 hover:text-rose-300 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer select-none border border-rose-900/30"
                        title="ল্যাডিং পেজ ডিলিট করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl py-14 text-center space-y-3.5">
                <AlertTriangle className="w-9 h-9 text-amber-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base">কোন ডাইনামিক ল্যান্ডিং পেজ নেই!</h3>
                  <p className="text-zinc-550 text-xs font-bold max-w-sm mx-auto">প্রোমো প্রমোশনের জন্য নতুন ক্যাম্পিং ল্যান্ডিং পেজ তৈরি করুন অথবা রিসেট করুন।</p>
                </div>
                <button
                  onClick={handleOpenCreateForm}
                  className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> প্রথম ল্যান্ডিং পেজ তৈরি করুণ
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Form Left Control Panel */}
            <form onSubmit={handleSaveForm} className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 h-fit text-left">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {activeFormId ? 'ল্যান্ডিং পেজ কাস্টমাইজেশন' : 'নতুন ল্যান্ডিং পেজ এডিটর ফর্ম'}
                  </h3>
                  <p className="text-zinc-400 text-xs">নিজের ব্র্যান্ডে প্রমোশনাল স্লোগান ও অফার কাস্টম করুন</p>
                </div>
                <span className="text-[10px] bg-indigo-900/30 border border-indigo-900 text-indigo-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  DESIGN MODE
                </span>
              </div>

              {/* Form Input Blocks */}
              <div className="space-y-4">
                {/* 1. Page Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">১. পৃষ্ঠার নাম / টাইটেল (ভিতরের রেফারেন্সের জন্য):</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: প্রিমিয়াম লেদার শু ল্যান্ডিং পেজ"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-all"
                  />
                </div>

                {/* 2. Connect Product Select */}
                <div className="space-y-1.5 relative">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">২. ক্যাটালগ প্রোডাক্টের সাথে সংযোগ করুন:</label>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white flex justify-between items-center cursor-pointer select-none hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      <img src={selectedProductObj?.image} alt="" className="w-6 h-6 object-cover rounded border border-zinc-800" referrerPolicy="no-referrer" />
                      <span className="font-bold text-zinc-200">{selectedProductObj?.banglaName || selectedProductObj?.name} (৳{selectedProductObj?.price})</span>
                    </div>
                    <Search className="w-4 h-4 text-zinc-500" />
                  </div>

                  {/* Reactive Select Search dropdown Overlay */}
                  {isDropdownOpen && (
                    <div className="absolute top-[102%] left-0 w-full bg-zinc-950 border border-zinc-800 rounded-xl max-h-56 overflow-y-auto z-40 p-2 shadow-2xl">
                      <input 
                        type="text"
                        placeholder="প্রোডাক্ট সার্চ করতে নাম লিখুন..."
                        value={formSearchProduct}
                        onChange={(e) => setFormSearchProduct(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs rounded-lg text-white mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                      />
                      <div className="space-y-1.5">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map(p => (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => handleSelectProduct(p)}
                              className="w-full hover:bg-zinc-900 text-left p-2 rounded-lg flex items-center gap-2.5 transition border border-transparent hover:border-zinc-800 cursor-pointer text-xs"
                            >
                              <img src={p.image} alt="" className="w-8 h-8 object-cover rounded border border-zinc-800" referrerPolicy="no-referrer" />
                              <div className="flex-1 truncate">
                                <span className="font-extrabold text-zinc-200 block truncate leading-tight">{p.banglaName || p.name}</span>
                                <span className="text-[10px] text-indigo-400 font-mono font-bold block">৳{p.price} | SKU: {p.sku}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-zinc-500 font-bold p-3 text-center text-[11px] font-sans">
                             কোন প্রোডাক্ট পাওয়া যায়নি!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Theme Preset Circle Options */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">৩. ডিজাইন থিম প্রিসেট নির্বাচন করুন:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-1">
                    {[
                      { theme: 'Warm Amber', color: '#f59e0b', lab: 'উষ্ণ সোনালী' },
                      { theme: 'Deep Emerald', color: '#10b981', lab: 'সবুজ অরগানিক' },
                      { theme: 'Cosmic Blue', color: '#3b82f6', lab: 'নীল মডার্ন' },
                      { theme: 'Sleek Charcoal', color: '#374151', lab: 'ধূসর ক্লাসিক' },
                      { theme: 'Bold Red', color: '#ef4444', lab: 'বোল্ড রেড' }
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.theme}
                        onClick={() => handleSelectTheme(opt.theme as LandingPageTheme)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer select-none ${
                          formData.theme === opt.theme 
                            ? 'border-indigo-550 bg-indigo-900/10' 
                            : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-850'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full block border border-zinc-700" style={{ backgroundColor: opt.color }} />
                        <span className="text-[10px] font-extrabold text-white block select-none leading-none mt-1">{opt.theme}</span>
                        <span className="text-[9px] text-zinc-500 block leading-none">{opt.lab}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Badge Text */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">৪. হিরো ব্যাজ টেক্সট (অফার স্লোগান):</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                    placeholder="যেমন: ১০০% আসল ফেব্রিক এবং কমফোর্টেবল!"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 5. Main Hero Headline */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">৫. প্রথম প্রধান বিজ্ঞাপনী হেডলাইন (Headline):</label>
                  <input
                    type="text"
                    required
                    value={formData.headline}
                    onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                    placeholder="যেমন: সেরা মানের পণ্য নিয়ে প্রস্তুত Feelzone, ক্যাশব্যাক অফারে"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {/* 6. Subheadline Copy */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">৬. সাব-হেডলাইন এবং বডি কন্টেন্ট কপি:</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.subheadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, subheadline: e.target.value }))}
                    placeholder="বিবরণমূলক প্যারাগ্রাফ যা কাস্টমারকে তাৎক্ষণিক অর্ডার করতে উৎসাহিত করবে।"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed"
                  />
                </div>

                {/* 7. Guarantee Text */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider">৭. কাস্টমার ট্রাস্ট নিশ্চয়তা টেক্সট:</label>
                  <input
                    type="text"
                    required
                    value={formData.guaranteeText}
                    onChange={(e) => setFormData(prev => ({ ...prev, guaranteeText: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 8. YouTube Video URL (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-zinc-400 font-black block uppercase tracking-wider flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-rose-500" /> ৮. ইউটিউব রিভিউ ভিডিও লিংক (অপশনাল):
                    </label>
                    <span className="text-[9px] text-zinc-500 italic font-mono">YouTube embed supported</span>
                  </div>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="যেমন: https://www.youtube.com/embed/dQw4w9WgXcQ"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Action save buttons */}
              <div className="border-t border-zinc-800 pt-5 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="bg-zinc-850 hover:bg-zinc-800 text-zinc-400 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="bg-teal-650 hover:bg-teal-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold tracking-wide transition shadow-lg shadow-teal-900/10 active:scale-97 cursor-pointer select-none"
                  id="btn-save-lp"
                >
                  {activeFormId ? 'সংরক্ষণ ও আপডেট করুন' : 'নতুন পেজ নিশ্চিত করুন'}
                </button>
              </div>
            </form>

            {/* Simulated Live Mobile preview Right Column */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>রিয়েল-টাইম ইন্টারেক্টিভ কাস্টমার ভিউ</span>
                </h3>
                <p className="text-zinc-550 text-xs">আপনার ড্রাফটের প্রতিটি হরফ মোবাইলে ঠিক যেমনটি দেখাবে</p>
              </div>

              {/* Mock Mobile Wrapper Container Frame */}
              <div className="bg-zinc-950 border-4 border-zinc-800 rounded-[3rem] p-3 shadow-2xl relative max-w-[340px] mx-auto overflow-hidden ring-4 ring-zinc-900 ring-offset-2 ring-offset-zinc-950 aspect-[9/18.5] flex flex-col">
                
                {/* Smartphone Speaker/Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-zinc-850 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* Smartphone screen top bar overlay */}
                <div className="flex justify-between items-center px-4 pt-4 pb-2 z-10 text-[9px] font-mono text-zinc-400 font-bold bg-transparent select-none shrink-0">
                  <span className="text-zinc-300 select-none">Feelzone 5G</span>
                  <div className="flex items-center gap-0.5 text-[8.5px]">
                    <span>13:26 PM</span>
                    <span className="ml-1">🔋 98%</span>
                  </div>
                </div>

                {/* Live Responsive Mobile Screen Content block */}
                <div className={`flex-1 rounded-[1.8rem] overflow-hidden ${mockStyles.bg} text-stone-900 flex flex-col relative`}>
                  
                  {/* Top navbar promo bar */}
                  <div className="bg-zinc-950/90 text-white font-mono py-1 px-3 text-[7.5px] uppercase flex justify-between items-center border-b border-zinc-850 shrink-0">
                    <span className="text-teal-400 select-none">Feelzone Promo</span>
                    <span className="opacity-70">lp-{activeFormId || 'draft'}</span>
                  </div>

                  {/* Body Content area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left font-sans select-none scrollbar-none">
                    
                    {/* Badge */}
                    {formData.badgeText && (
                      <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${mockStyles.badge}`}>
                        {formData.badgeText}
                      </span>
                    )}

                    {/* Headline */}
                    <h1 className={`text-sm sm:text-base font-black leading-snug ${formData.theme === 'Cosmic Blue' ? 'text-zinc-100' : 'text-slate-900'}`}>
                      {formData.headline || 'আপনার ল্যান্ডিং পেজ কাস্টম স্লোগান এখানে প্রদর্শিত হবে...'}
                    </h1>

                    {/* Subheadline description */}
                    <p className={`text-[10px] leading-relaxed opacity-85 ${formData.theme === 'Cosmic Blue' ? 'text-zinc-300' : 'text-slate-700'}`}>
                      {formData.subheadline || 'এই ফিল্ডে প্রডাক্টটির স্পেশাল ফিটনেস, কোয়ালিটি নিশ্চয়তা ও কাস্টমার রিভিউকে প্ররোচিত করে আকর্ষণীয় লেখা যুক্ত করুন।'}
                    </p>

                    {/* Shield guarantee block */}
                    <div className={`p-2.5 rounded-lg border-l-2 border-emerald-500 bg-white/70 shadow-2xs space-y-0.5`}>
                      <h4 className="font-bold text-[9px] text-stone-900 flex items-center gap-1 leading-none">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> বিশেষ গ্যারান্টি
                      </h4>
                      <p className="text-[8.5px] text-stone-600 leading-normal">{formData.guaranteeText || 'ডেলিভারি চেক ও রিটার্ন স্লিপ পলিসি।'}</p>
                    </div>

                    {/* Product Checkout Card preview */}
                    <div className={`rounded-xl border p-2.5 flex flex-col gap-2 bg-white ${mockStyles.pCard} shadow-xs`}>
                      <div className="relative rounded-lg overflow-hidden aspect-video bg-zinc-100/45 border border-zinc-150 p-2 text-center text-[10px] font-bold text-zinc-500 leading-none flex items-center justify-center">
                        {selectedProductObj ? (
                          <img src={selectedProductObj.image} alt="" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                        ) : (
                          <span>সংযুক্ত প্রোডাক্ট ক্যাটালগ...</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-black text-[11px] text-zinc-900 truncate">{selectedProductObj?.banglaName || selectedProductObj?.name || 'ফ্যাশন পণ্য সংগ্রহ'}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-rose-600">৳{selectedProductObj?.price?.toLocaleString() || '---'}</span>
                          {selectedProductObj?.originalPrice && (
                            <span className="text-[9px] line-through text-zinc-400">৳{selectedProductObj?.originalPrice?.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Mock customer billing inputs */}
                      <div className="pt-2 border-t border-zinc-100 space-y-1.5 text-[8.5px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-400">১. আপনার নাম লিখুন:</span>
                          <div className="w-full bg-zinc-50 border border-zinc-200 p-1 rounded font-serif">-</div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-400">২. মোবাইল নম্বর:</span>
                          <div className="w-full bg-zinc-50 border border-zinc-200 p-1 rounded font-serif">-</div>
                        </div>
                        <button
                          type="button"
                          className={`w-full py-2 rounded-lg text-center font-black uppercase text-[10px] leading-tight shadow-sm select-none transition-all duration-300 ${mockStyles.btn}`}
                        >
                          <ShoppingCart className="w-3 h-3 inline mr-1" /> অর্ডার নিশ্চিত করুন →
                        </button>
                      </div>
                    </div>

                    {/* Simulated Testimonials loop */}
                    <div className="p-2.5 rounded-lg bg-white/70 shadow-2xs font-sans italic space-y-1 select-none text-[8.5px]">
                      <div className="flex text-yellow-500 gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-zinc-650 leading-relaxed">"অর্ডার করার পরদিনই ডেলিভারি পেলাম। গুণগত মান এক কথায় অনন্য। সবাই চোখ বন্ধ করে নিতে পারেন!"</p>
                      <span className="font-extrabold block not-italic text-[7.5px] text-zinc-400 leading-none">— কায়সার হামিদ, ঢাকা</span>
                    </div>

                  </div>
                </div>

                {/* Smartphone Home bottom line pill */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-24 bg-zinc-800 rounded-full z-20" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
