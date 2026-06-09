import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface PromoBannerProps {
  setSelectedCategory: (category: string) => void;
  setActiveLandingId: (id: string | null) => void;
}

export default function PromoBanner({
  setSelectedCategory,
  setActiveLandingId
}: PromoBannerProps) {
  const [badge, setBadge] = useState('এক্সক্লুসিভ ও আকর্ষণীয় গিফট কালেকশন');
  const [headline, setHeadline] = useState('প্রিয়জনদের মুখে হাসি ফোটাতে সেরা উপহার!');
  const [subheadline, setSubheadline] = useState('ভালোবাসা ও যত্নে সাজানো আমাদের দৃষ্টিনন্দন গিফট হ্যাম্পার ও অভিনব ব্যক্তিগত উপহারসমূহ। আজই অর্ডার করুন চমৎকার অফারে!');
  const [themeColor, setThemeColor] = useState('from-teal-700 via-emerald-600 to-teal-800');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'banner'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.badge) setBadge(data.badge);
        if (data.headline) setHeadline(data.headline);
        if (data.subheadline) setSubheadline(data.subheadline);
        if (data.themeColor) setThemeColor(data.themeColor);
      }
    }, (err) => {
      console.warn('Could not read dynamic banner settings from Firestore:', err);
    });

    return () => unsub();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6" id="customer-promo-banner-wrapper">
      <div className={`bg-gradient-to-r ${themeColor} text-white rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-xl`} id="promo-banner-container">
        {/* Ambient radial accent overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Content area */}
        <div className="max-w-lg space-y-4 relative z-10" id="promo-banner-content">
          <span className="bg-amber-400 text-teal-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block" id="promo-banner-badge">
            {badge}
          </span>
          
          <h2 className="text-3xl md:text-5xl font-black leading-tight" id="promo-banner-headline">
            {headline}
          </h2>
          
          <p className="text-sm opacity-90 leading-relaxed" id="promo-banner-subheadline">
            {subheadline}
          </p>
          
          <div className="flex gap-4 pt-2" id="promo-banner-actions">
            <button 
              onClick={() => setSelectedCategory('All')}
              className="bg-white text-teal-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-md hover:bg-slate-50 transition cursor-pointer select-none"
              id="promo-banner-view-products"
            >
              পণ্যসমূহ দেখুন
            </button>
            <button 
              onClick={() => setActiveLandingId('land-1')}
              className="bg-teal-900/40 text-white border border-white/20 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-teal-900/60 transition cursor-pointer flex items-center gap-1.5 select-none"
              id="promo-banner-preview-landing"
            >
              <Smartphone className="w-4 h-4 text-amber-300" /> ল্যান্ডিং পেজ প্রিভিউ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
