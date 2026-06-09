import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Layout } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminBannerPanelProps {
  triggerSystemNotification: (msg: string) => void;
}

export default function AdminBannerPanel({ triggerSystemNotification }: AdminBannerPanelProps) {
  const [badge, setBadge] = useState('এক্সক্লুসিভ ও আকর্ষণীয় গিফট কালেকশন');
  const [headline, setHeadline] = useState('প্রিয়জনদের মুখে হাসি ফোটাতে সেরা উপহার!');
  const [subheadline, setSubheadline] = useState('ভালোবাসা ও যত্নে সাজানো আমাদের দৃষ্টিনন্দন গিফট হ্যাম্পার ও অভিনব ব্যক্তিগত উপহারসমূহ। আজই অর্ডার করুন চমৎকার অফারে!');
  const [themeColor, setThemeColor] = useState('from-teal-700 via-emerald-600 to-teal-800');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBannerSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'banner'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.badge) setBadge(data.badge);
          if (data.headline) setHeadline(data.headline);
          if (data.subheadline) setSubheadline(data.subheadline);
          if (data.themeColor) setThemeColor(data.themeColor);
        }
      } catch (err) {
        console.error('Error fetching banner settings details:', err);
      }
    };
    fetchBannerSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'banner'), {
        badge,
        headline,
        subheadline,
        themeColor,
        updatedAt: new Date().toISOString()
      });
      triggerSystemNotification('✨ ব্যানার তথ্য সফলভাবে ফায়ারবেসে হালনাগাদ করা হয়েছে!');
    } catch (err) {
      console.error('Error saving banner setup:', err);
      triggerSystemNotification('❌ ব্যানার তথ্য সংরক্ষণ করতে ত্রুটি হয়েছে!');
    } finally {
      setIsSaving(false);
    }
  };

  const presetThemes = [
    { name: 'Teal Forest', value: 'from-teal-700 via-emerald-600 to-teal-800' },
    { name: 'Cosmic Royal Blue', value: 'from-blue-700 via-indigo-600 to-indigo-800' },
    { name: 'Lavish Fuchsia', value: 'from-purple-700 via-fuchsia-600 to-purple-800' },
    { name: 'Sunset Spark', value: 'from-rose-700 via-rose-600 to-orange-700' }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6" id="admin-banner-panel-container">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3" id="admin-banner-headline-wrapper">
        <Layout className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="font-extrabold text-base text-white">হোম পেজ প্রোমোশনাল ব্যানার ম্যানেজার</h3>
          <p className="text-zinc-400 text-xs text-[11px]">গ্রাহক স্টোরের প্রথম স্ক্রিনে দৃশ্যমান মূল ব্যানার কাস্টমাইজ করুন</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4" id="admin-banner-form">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-bold block">ব্যানার ব্যাজ টেক্সট (অফার রিবন) *</label>
          <input 
            type="text"
            required
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
            placeholder="যেমন: বিশেষ আকর্ষণীয় অফার!"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-bold block">ব্যানার বড় শিরোনাম (Headline) *</label>
          <input 
            type="text"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
            placeholder="যেমন: প্রিয়জনদের মুখে হাসি ফোটাতে সেরা উপহার!"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-bold block">ব্যানার উপ-শিরোনাম / ডেসক্রিপশন *</label>
          <textarea 
            required
            rows={3}
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white resize-none"
            placeholder="ব্যানার সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-bold block">ব্যানার থিম কালার গ্র্যাডিয়েন্ট</label>
          <div className="grid grid-cols-2 gap-2" id="admin-banner-preset-themes">
            {presetThemes.map((theme) => (
              <button
                type="button"
                key={theme.value}
                onClick={() => setThemeColor(theme.value)}
                className={`py-2 px-3 rounded-xl border text-left flex items-center justify-between text-[11px] transition cursor-pointer select-none ${
                  themeColor === theme.value 
                    ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{theme.name}</span>
                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.value}`}></span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            id="admin-banner-save-btn"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'ব্যানার ডাটা সিংক করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
