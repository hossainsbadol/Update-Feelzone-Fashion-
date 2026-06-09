import React, { useState, useEffect } from 'react';
import { Save, Globe, Eye } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminSEOPanelProps {
  triggerSystemNotification: (msg: string) => void;
}

export default function AdminSEOPanel({ triggerSystemNotification }: AdminSEOPanelProps) {
  const [metaTitle, setMetaTitle] = useState('FeelZone Fashion - Premium Customized Photo Frames & Art Gallery Bangladesh');
  const [metaDescription, setMetaDescription] = useState('FeelZone Fashion (পূর্বে Feelzone Gift Shop) বাংলাদেশের অত্যন্ত জনপ্রিয় ও আস্থাশীল অনলাইন কাস্টমাইজড ফটো ফ্রেম ও প্রিমিয়াম আর্ট গ্যালারি প্ল্যাটফর্ম। আমরা সাশ্রয়ী মূল্যে সেরা ডিজাইনের দৃষ্টিনন্দন উপহার সামগ্রী সরাসরি সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'seo'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.title) setMetaTitle(data.title);
          if (data.description) setMetaDescription(data.description);
        }
      } catch (err) {
        console.error('Error fetching SEO settings details:', err);
      }
    };
    fetchSEOSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'seo'), {
        title: metaTitle,
        description: metaDescription,
        updatedAt: new Date().toISOString()
      });
      triggerSystemNotification('✨ এসইও মেটা শিরোনাম এবং বিবরণ সফলভাবে ফায়ারবেসে হালনাগাদ করা হয়েছে!');
    } catch (err) {
      console.error('Error saving SEO setup:', err);
      triggerSystemNotification('❌ এসইও তথ্য সংরক্ষণ করতে ত্রুটি হয়েছে!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6" id="admin-seo-panel-container">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3" id="admin-seo-headline-wrapper">
        <Globe className="w-5 h-5 text-teal-400" />
        <div>
          <h3 className="font-extrabold text-base text-white">গ্লোবাল এসইও (SEO) মেটা সেটিংস</h3>
          <p className="text-zinc-400 text-xs text-[11px]">আপনার অনলাইন স্টোরের সার্চ ইঞ্জিন মেটা টাইটেল ও ডেসক্রিপশন সেট করুন</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4" id="admin-seo-form">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-bold block">মেটা শিরোনাম (Meta Title) *</label>
          <input 
            type="text"
            required
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={100}
            className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white font-sans"
            placeholder="যেমন: FeelZone Fashion - Premium Customized Photo Frames Bangladesh"
          />
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span>সার্চ ইঞ্জিনের জন্য ৫০-৬০ শব্দের মধ্যে টাইটেল সেরা।</span>
            <span className={`${metaTitle.length > 60 ? 'text-amber-500' : 'text-zinc-500'}`}>{metaTitle.length}/100 অক্ষর</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400 font-bold block">মেটা বিবরণ (Meta Description) *</label>
          <textarea 
            required
            rows={4}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={300}
            className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white resize-none font-sans leading-relaxed"
            placeholder="আপনার দোকান সম্পর্কে একটি আকর্ষণীয় সংক্ষিপ্ত বিবরণ দিন যা সার্চ ফলাফলে প্রদর্শিত হবে..."
          />
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span>সার্চ ইঞ্জিনের জন্য ১২০-১৬০ শব্দের মধ্যে বিবরণ সেরা।</span>
            <span className={`${metaDescription.length > 160 ? 'text-amber-505' : 'text-zinc-500'}`}>{metaDescription.length}/300 অক্ষর</span>
          </div>
        </div>

        {/* Live Google Search Preview Simulation */}
        <div className="bg-zinc-950 p-4 border border-zinc-805 rounded-xl space-y-1.5" id="seo-google-preview">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Globe className="w-3 h-3 text-emerald-500" />
            <span>https://feelzone-fashion.com</span>
          </div>
          <h4 className="text-sm font-bold text-blue-400 hover:underline cursor-pointer leading-tight line-clamp-1">
            {metaTitle || 'মেটা শিরোনাম এখানে প্রদর্শিত হবে'}
          </h4>
          <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2">
            {metaDescription || 'মেটা ডেসক্রিপশন এখানে প্রদর্শিত হবে যা সার্চের ফলাফলে গুগল দেখাবে।'}
          </p>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-teal-600 hover:bg-teal-750 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'এসইও মেটা ডাটা আপডেট করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
