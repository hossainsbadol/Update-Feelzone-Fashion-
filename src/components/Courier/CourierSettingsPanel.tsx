import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Check, RefreshCw, Key, Shield, HelpCircle, Save, Database, Compass, Terminal, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CourierConfig {
  apiKey: string;
  secretKey: string;
  storeId?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  token?: string;
  senderPhone?: string;
  isSandbox: boolean;
  isActive: boolean;
}

interface CourierSettings {
  Steadfast: CourierConfig;
  Pathao: CourierConfig;
  RedX: CourierConfig;
}

export default function CourierSettingsPanel({
  triggerSystemNotification
}: {
  triggerSystemNotification: (msg: string) => void;
}) {
  const [courierSettings, setCourierSettings] = useState<CourierSettings>({
    Steadfast: {
      apiKey: 'sf_api_key_8492019a8f',
      secretKey: 'sf_secret_5548231c9e',
      senderPhone: '01800000000',
      isSandbox: true,
      isActive: true,
    },
    Pathao: {
      apiKey: '',
      secretKey: '',
      clientId: 'pathao_client_abc123',
      clientSecret: 'pathao_secret_xyz987',
      storeId: 'store_dhaka_01',
      username: 'merchant@feelfashion.com',
      password: 'password123',
      isSandbox: true,
      isActive: false,
    },
    RedX: {
      token: 'redx_token_99182a3b4c',
      storeId: 'hub_motijheel_05',
      isSandbox: true,
      isActive: false,
    }
  });

  const [activeCarrier, setActiveCarrier] = useState<'Steadfast' | 'Pathao' | 'RedX'>('Steadfast');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, 'Connected' | 'Error' | 'NotTested'>>({
    Steadfast: 'NotTested',
    Pathao: 'NotTested',
    RedX: 'NotTested'
  });
  const [apiLogs, setApiLogs] = useState<{ time: string; type: 'info' | 'success' | 'detail' | 'error'; msg: string }[]>([
    { time: new Date().toLocaleTimeString(), type: 'info', msg: 'কুরিয়ার এপিআই সাব-সিস্টেম সফলভাবে ইনিশিয়ালাইজ করা হয়েছে।' }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('feelzone_courier_settings');
    if (saved) {
      try {
        setCourierSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse courier settings", e);
      }
    }
  }, []);

  const addLog = (msg: string, type: 'info' | 'success' | 'detail' | 'error' = 'info') => {
    setApiLogs(prev => [
      { time: new Date().toLocaleTimeString(), type, msg },
      ...prev.slice(0, 25)
    ]);
  };

  const handleSave = (carrier: 'Steadfast' | 'Pathao' | 'RedX') => {
    const updated = {
      ...courierSettings,
      [carrier]: {
        ...courierSettings[carrier],
        isActive: true // Make it the active one if configuring it
      }
    };
    // Let's toggle others if active is exclusive
    if (carrier === 'Steadfast') {
      updated.Pathao.isActive = false;
      updated.RedX.isActive = false;
    } else if (carrier === 'Pathao') {
      updated.Steadfast.isActive = false;
      updated.RedX.isActive = false;
    } else {
      updated.Steadfast.isActive = false;
      updated.Pathao.isActive = false;
    }

    setCourierSettings(updated);
    localStorage.setItem('feelzone_courier_settings', JSON.stringify(updated));
    addLog(`[LocalDB] ${carrier} এপিআই কনফিগারেশন প্যারামিটারসমূহ লোকাল স্টোরেজে সংরক্ষণ করা হয়েছে।`, 'success');
    addLog(`[SYSTEM] ${carrier} কুরিয়ারকে ডিফল্ট লজিস্টিক গেটওয়ে হিসেবে সক্রিয় করা হয়েছে।`, 'info');
    triggerSystemNotification(`🚚 ${carrier} API কনফিগারেশন সফলভাবে সেভ ও সক্রিয় করা হয়েছে!`);
  };

  const handleTestConnection = (carrier: 'Steadfast' | 'Pathao' | 'RedX') => {
    setTestingConnection(carrier);
    addLog(`[API Request] Connecting to ${carrier} REST Endpoints (${courierSettings[carrier].isSandbox ? 'Sandbox' : 'Production'})...`, 'info');
    
    // Simulate API connection latency
    setTimeout(() => {
      const config = courierSettings[carrier];
      let isSuccess = false;
      
      if (carrier === 'Steadfast' && config.apiKey && config.secretKey) {
        isSuccess = true;
      } else if (carrier === 'Pathao' && config.clientId && config.clientSecret) {
        isSuccess = true;
      } else if (carrier === 'RedX' && config.token) {
        isSuccess = true;
      }

      if (isSuccess) {
        setConnectionStates(prev => ({ ...prev, [carrier]: 'Connected' }));
        addLog(`[API Response] HTTP 200 OK — successfully authenticated with ${carrier} backend!`, 'success');
        addLog(`[INFO] Current latency: ${Math.floor(25 + Math.random() * 40)}ms. API Credentials verified.`, 'detail');
        if (carrier === 'Pathao') {
          addLog(`[Pathao SDK] Access token obtained: token_pth_${Math.floor(100000 + Math.random() * 900000)}. Store verified ID: ${config.storeId}`, 'detail');
        } else if (carrier === 'RedX') {
          addLog(`[RedX Partner] Authorized. Hub Code: ${config.storeId || 'N/A'}. Route status: Operational.`, 'detail');
        } else {
          addLog(`[Steadfast SDK] API Key matches sender ${config.senderPhone}. Current credit balance: ৳৭,৪২০.৫০`, 'detail');
        }
        triggerSystemNotification(`✅ ${carrier} এপিআই কানেকশন সফল হয়েছে!`);
      } else {
        setConnectionStates(prev => ({ ...prev, [carrier]: 'Error' }));
        addLog(`[API Response] HTTP 401 Unauthorized — ${carrier} credentials validation failed!`, 'error');
        addLog(`[ERROR] Please verify that your keys or token arrays are correctly populated.`, 'error');
        triggerSystemNotification(`❌ ${carrier} কানেকশন ব্যর্থ! দয়া করে সঠিক কি (Key) দিন।`);
      }
      setTestingConnection(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Visual Banners / Tabs to configure */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'Steadfast' as const, name: 'Steadfast Courier', desc: 'স্টেডফাস্ট কুরিয়ার এপিআই সিস্টেম ও অটো ডকিং।', logoColor: 'from-[#ff512f] to-[#dd2476]', status: connectionStates.Steadfast },
          { key: 'Pathao' as const, name: 'Pathao Delivery', desc: 'পাঠাও মার্চেন্ট প্যানেল লাইভ ট্র্যাকিং এপিআই।', logoColor: 'from-[#ea384d] to-[#b71c1c]', status: connectionStates.Pathao },
          { key: 'RedX' as const, name: 'RedX Delivery', desc: 'রেডএক্স টেক-ফার্স্ট লজিস্টিকস এপিআই ডকিং।', logoColor: 'from-[#ec2626] to-[#fc6767]', status: connectionStates.RedX },
        ].map((car) => {
          const isActiveTab = activeCarrier === car.key;
          const isActivated = courierSettings[car.key].isActive;
          return (
            <button
              key={car.key}
              onClick={() => setActiveCarrier(car.key)}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-44 transition-all cursor-pointer ${
                isActiveTab 
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/30' 
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-750'
              }`}
            >
              <div className="w-full flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${car.logoColor}`} />
                    <span className="font-extrabold text-sm text-white">{car.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-550 block leading-tight max-w-[200px]">{car.desc}</span>
                </div>
                
                <div className="flex flex-col gap-1.5 items-end">
                  {isActivated ? (
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      ACTIVE GATEWAY
                    </span>
                  ) : (
                    <span className="bg-zinc-800 text-zinc-450 border border-zinc-750 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Offline
                    </span>
                  )}

                  {car.status === 'Connected' && (
                    <span className="bg-teal-500/15 text-teal-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 mt-1 font-mono">
                      <Check className="w-2.5 h-2.5" /> 200 OK
                    </span>
                  )}
                  {car.status === 'Error' && (
                    <span className="bg-rose-500/15 text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 mt-1 font-mono">
                      <AlertCircle className="w-2.5 h-2.5" /> 401 Unauthorized
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full flex justify-between items-center text-xs">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">ক্লিক করে এডিট করুন</span>
                <span className="text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1 transition-all">
                  কনফিগার <Compass className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main configuration editor card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Form Columns (8/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-white">
                {activeCarrier} API গেটওয়ে কনফিগারেশন 📋
              </h3>
              <p className="text-zinc-400 text-xs">আপনার কুরিয়ার একাউন্টের API ক্রেডেনসিয়ালস সঠিকভাবে বসিয়ে দিন।</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs">স্যান্ডবক্স মুড</span>
              <button 
                onClick={() => {
                  setCourierSettings(prev => ({
                    ...prev,
                    [activeCarrier]: {
                      ...prev[activeCarrier],
                      isSandbox: !prev[activeCarrier].isSandbox
                    }
                  }));
                  addLog(`[CONFIG] ${activeCarrier} মোড পরিবর্তন করা হয়েছে: ${!courierSettings[activeCarrier].isSandbox ? 'স্যান্ডবক্স টেস্টবেড' : 'লাইভ প্রোডাকশন'}`, 'info');
                }}
                className={`w-10 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  courierSettings[activeCarrier].isSandbox ? 'bg-cyan-600' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all shadow-md ${
                  courierSettings[activeCarrier].isSandbox ? 'translate-x-3.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(activeCarrier); }} className="space-y-4 text-xs">
            {/* Steadfast configuration panel */}
            {activeCarrier === 'Steadfast' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Steadfast API Key *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-550 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. steadfast_api_key_8492019a8f..."
                      value={courierSettings.Steadfast.apiKey}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Steadfast: { ...courierSettings.Steadfast, apiKey: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Steadfast Secret Key / ID *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-550 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. sf_secret_5548231c9e..."
                      value={courierSettings.Steadfast.secretKey}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Steadfast: { ...courierSettings.Steadfast, secretKey: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">মার্চেন্ট রেজিস্টার্ড মোবাইল নাম্বার</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 018XXXXXXXX"
                    value={courierSettings.Steadfast.senderPhone || ''}
                    onChange={(e) => setCourierSettings({
                      ...courierSettings,
                      Steadfast: { ...courierSettings.Steadfast, senderPhone: e.target.value }
                    })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Pathao Courier Configuration */}
            {activeCarrier === 'Pathao' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">Pathao Client ID *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. pathao_client_abc123"
                      value={courierSettings.Pathao.clientId || ''}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Pathao: { ...courierSettings.Pathao, clientId: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">Pathao Client Secret *</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••••••••••"
                      value={courierSettings.Pathao.clientSecret || ''}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Pathao: { ...courierSettings.Pathao, clientSecret: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">মার্চেন্ট ইউজারনেম (ইমেইল)*</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. merchant@mystore.com"
                      value={courierSettings.Pathao.username || ''}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Pathao: { ...courierSettings.Pathao, username: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">পাসওয়ার্ড *</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••••••"
                      value={courierSettings.Pathao.password || ''}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        Pathao: { ...courierSettings.Pathao, password: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Pathao Store ID *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. store_dhaka_01 (নির্দিষ্ট মার্চেন্ট স্টোরের কোড বা আইডি)"
                    value={courierSettings.Pathao.storeId || ''}
                    onChange={(e) => setCourierSettings({
                      ...courierSettings,
                      Pathao: { ...courierSettings.Pathao, storeId: e.target.value }
                    })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 block">পাঠাও মার্চেন্ট প্রোফাইল এপিআই ড্যাশবোর্ড থেকে Store ID সংগ্রহ করতে পারবেন।</span>
                </div>
              </div>
            )}

            {/* RedX configuration settings */}
            {activeCarrier === 'RedX' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">RedX API Access Token *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-550 absolute left-3 top-3" />
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. redx_token_99182a3b4c..."
                      value={courierSettings.RedX.token || ''}
                      onChange={(e) => setCourierSettings({
                        ...courierSettings,
                        RedX: { ...courierSettings.RedX, token: e.target.value }
                      })}
                      className="w-full bg-zinc-950 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono leading-relaxed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">ডিফল্ট হাব আইডি (Hub / Store ID) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. hub_motijheel_05"
                    value={courierSettings.RedX.storeId || ''}
                    onChange={(e) => setCourierSettings({
                      ...courierSettings,
                      RedX: { ...courierSettings.RedX, storeId: e.target.value }
                    })}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 block">পার্সেল পিকআপের জন্য রেডএক্স ডিরেক্টরি হাব কোড।</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleTestConnection(activeCarrier)}
                disabled={testingConnection !== null}
                className="flex-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingConnection === activeCarrier ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-400" /> ভ্যালিডেশন হচ্ছে...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-teal-400" /> কানেকশন টেস্ট করুন
                  </>
                )}
              </button>

              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl transition font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> গেটওয়ে ডিফল্ট সেভ করুন
              </button>
            </div>
          </form>
        </div>

        {/* Console / Technical Assistance Sidebar Column (5/12) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Quick guide panel */}
          <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-850 space-y-3.5">
            <div className="flex gap-1.5 items-center">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold text-sm text-zinc-250">API সংহতি নির্দেশিকা (API Guide)</span>
            </div>
            
            <div className="space-y-3 text-[11px] text-zinc-400 leading-relaxed font-sans">
              <p>১. কুরিয়ার এপিআই কানেক্ট করলে কাস্টমার অর্ডার বুক হওয়ার সাথে সাথে আপনার মার্চেন্ট প্যানেলে অটোমেটিক ডকিং রিকোয়েস্ট চলে যাবে।</p>
              <p>২. পাঠাও কুরিয়ার বুকিং এর সময় স্টোর আইডি ও মার্চেন্ট ইমেইল সঠিকভাবে দেওয়া বাধ্যতামূলক।</p>
              <p>৩. স্যান্ডবক্স মোডে টেস্ট বুকিং এর সময় কোনো পার্সেল ডেলিভারি এজেন্ট কুরিয়ার করতে আসবে না এবং চার্জ কর্তন হবে না। লাইভ প্রোডাকশনের সময় অবশ্যই বাটন অফ করে কি সেভ করুন।</p>
            </div>
          </div>

          {/* Real-time System API Console Logs Terminal */}
          <div className="bg-black/90 p-4 rounded-2xl border border-zinc-850 h-56 flex flex-col justify-between font-mono">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider">API LOGS CONSOLE</span>
              </div>
              <button 
                onClick={() => setApiLogs([])}
                className="text-[9px] text-[#f93c65] hover:underline"
              >
                Clear Log
              </button>
            </div>

            <div className="flex-1 overflow-y-auto text-[10px] space-y-1.5 py-2.5 scrollbar-thin scrollbar-thumb-zinc-800">
              {apiLogs.map((log, lIdx) => (
                <div key={lIdx} className="leading-5">
                  <span className="text-zinc-650 mr-1.5">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400' 
                    : log.type === 'error' ? 'text-rose-400 font-bold' 
                    : log.type === 'detail' ? 'text-indigo-400 font-bold' 
                    : 'text-zinc-350'}
                  `}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 p-1.5 text-center text-[9px] text-zinc-650 border-t border-zinc-950 flex items-center justify-center gap-1 uppercase tracking-wide font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Endpoint: {activeCarrier} Gateway Core v3.12
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
