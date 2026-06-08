import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShoppingCart, Star, Trash2, Check, ArrowRight, ShieldCheck, 
  X, Phone, MapPin, Truck, Download, Sparkles, Heart, Bell, Eye, Grid3X3, Smartphone, User, LogOut
} from 'lucide-react';
import { Product, Order, LandingPage, LandingPageTheme } from '../types';
import { BANGLADESH_DISTRICTS } from '../data';
import CategoryFilter from './Category/CategoryFilter';

interface CustomerStoreProps {
  products: Product[];
  landingPages: LandingPage[];
  onNewOrder: (order: Order) => void;
  triggerSystemNotification: (message: string) => void;
  activeLandingId: string | null;
  setActiveLandingId: (id: string | null) => void;
  emptyCategories?: string[];
}

export default function CustomerStore({
  products,
  landingPages,
  onNewOrder,
  triggerSystemNotification,
  activeLandingId,
  setActiveLandingId,
  emptyCategories = [],
}: CustomerStoreProps) {
  // Navigation & UI States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  
  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutDistrict, setCheckoutDistrict] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery' | 'Card'>('Cash on Delivery');
  
  // Simulated MFS Gateway State
  const [showMfsGateway, setShowMfsGateway] = useState(false);
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsStep, setMfsStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [mfsOtp, setMfsOtp] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  const [gatewayLogo, setGatewayLogo] = useState<string>('');
  const [gatewayColor, setGatewayColor] = useState<string>('');
  
  // Post-order Success Invoice View
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);

  // User Login States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!loginPhone || loginPhone.length < 11) {
        alert('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
        return;
      }
      setOtpSent(true);
      triggerSystemNotification(`📲 ওটিপি কোড পাঠানো হয়েছে আপনার ${loginPhone} নাম্বারে! (টেস্ট কোড: 1234)`);
    } else {
      if (loginOtp !== '1234') {
        alert('ভুল ওটিপি কোড! অনুগ্রহ করে 1234 দিয়ে চেষ্টা করুন।');
        return;
      }
      setIsLoggedIn(true);
      const suffix = loginPhone.slice(-4);
      setUserName(loginPhone === '01712345678' ? 'আব্দুর রহমান' : `গ্রাহক-${suffix}`);
      setShowLoginModal(false);
      triggerSystemNotification('🎉 আপনি সফলভাবে সাইন ইন করেছেন!');
    }
  };

  // Filter Categories
  const categories = ['All', ...Array.from(new Set([
    ...products.map(p => p.category),
    ...emptyCategories
  ]))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.banglaName && p.banglaName.includes(searchQuery)) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, quantity: qty }];
    });
    triggerSystemNotification(`🛒 ${product.name} কার্টে যোগ করা হয়েছে!`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  const toggleLike = (id: string) => {
    setLikedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Checkout process trigger
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      alert('দয়া করে সব তথ্য পূরণ করুন।');
      return;
    }
    
    if (paymentMethod === 'bKash' || paymentMethod === 'Nagad' || paymentMethod === 'Rocket') {
      // Open custom gorgeous Payment gateway mockup
      setMfsNumber(checkoutPhone);
      setMfsStep('number');
      setMfsOtp('');
      setMfsPin('');
      
      if (paymentMethod === 'bKash') {
        setGatewayLogo('bKash');
        setGatewayColor('bg-pink-600');
      } else if (paymentMethod === 'Nagad') {
        setGatewayLogo('Nagad');
        setGatewayColor('bg-orange-600');
      } else {
        setGatewayLogo('Rocket');
        setGatewayColor('bg-purple-700');
      }
      setShowMfsGateway(true);
    } else {
      // Completed Cash on delivery immediately
      completeOrder('Unpaid');
    }
  };

  const verifyMfsGateway = () => {
    if (mfsStep === 'number') {
      if (!mfsNumber || mfsNumber.length < 11) {
        alert('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
        return;
      }
      setMfsStep('otp');
    } else if (mfsStep === 'otp') {
      if (!mfsOtp || mfsOtp.length < 4) {
        alert('৪ ডিজিটের ওটিপি (OTP) দিন');
        return;
      }
      setMfsStep('pin');
    } else if (mfsStep === 'pin') {
      if (!mfsPin || mfsPin.length < 4) {
        alert('পিন নাম্বার দিন');
        return;
      }
      // Successful payment verified!
      setShowMfsGateway(false);
      completeOrder('Paid');
    }
  };

  const completeOrder = (payStatus: 'Paid' | 'Unpaid') => {
    // Basic automatic fraud scoring
    let fraudRiskScore = 5;
    const fraudReasons: string[] = [];

    const isSuspiciousPhone = !/^(01)[3-9]\d{8}$/.test(checkoutPhone);
    const hasRepeatedAddrName = checkoutName.toLowerCase().includes('test') || checkoutAddress.toLowerCase().includes('bosti') || checkoutAddress.length < 8;
    const isVeryHighValueCod = getCartTotal() > 8000 && paymentMethod === 'Cash on Delivery';

    if (isSuspiciousPhone) {
      fraudRiskScore += 30;
      fraudReasons.push('ফোন নাম্বারের গঠন প্রক্রিয়াটি বিজাতীয় বা সন্দেহজনক');
    }
    if (hasRepeatedAddrName) {
      fraudRiskScore += 35;
      fraudReasons.push('ঠিকানা ও নাম অত্যন্ত অস্পষ্ট এবং অসম্পূর্ণ মনে হচ্ছে');
    }
    if (isVeryHighValueCod) {
      fraudRiskScore += 25;
      fraudReasons.push('৮,০০০ টাকার অধিক মূল্যের সিওডি (COD) অর্ডার');
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      customerName: checkoutName,
      phone: checkoutPhone,
      address: checkoutAddress,
      district: checkoutDistrict,
      items: [...cart],
      totalAmount: getCartTotal(),
      paymentMethod,
      paymentStatus: payStatus,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      fraudRiskScore,
      fraudReasons
    };

    onNewOrder(newOrder);
    setRecentOrder(newOrder);
    
    // Clear State & Cart
    setCart([]);
    setIsCheckingOut(false);
    triggerSystemNotification(`🔥 নতুন অর্ডার ${orderId} এসেছে কাস্টমার ${checkoutName} থেকে!`);
  };

  // Render Theme Style configurations for 5 ready-made Landing page themes
  const renderLandingPage = (page: LandingPage) => {
    const product = products.find(p => p.id === page.productId) || products[0];
    
    // Selecting theme design style colors
    let themeBg = 'bg-stone-50 text-stone-900';
    let cardBg = 'bg-white';
    let btnColor = 'bg-amber-500 hover:bg-amber-600 text-stone-950';
    let accentBorder = 'border-amber-500';
    let badgeBg = 'bg-amber-100 text-amber-800';

    if (page.theme === 'Deep Emerald') {
      themeBg = 'bg-emerald-50 text-emerald-950';
      cardBg = 'bg-white';
      btnColor = 'bg-emerald-600 hover:bg-emerald-700 text-white';
      accentBorder = 'border-emerald-600';
      badgeBg = 'bg-emerald-100 text-emerald-800';
    } else if (page.theme === 'Cosmic Blue') {
      themeBg = 'bg-slate-900 text-slate-100';
      cardBg = 'bg-slate-800 border-slate-700';
      btnColor = 'bg-blue-600 hover:bg-blue-700 text-white';
      accentBorder = 'border-blue-500';
      badgeBg = 'bg-blue-900/50 text-blue-300';
    } else if (page.theme === 'Sleek Charcoal') {
      themeBg = 'bg-zinc-100 text-zinc-950';
      cardBg = 'bg-white';
      btnColor = 'bg-zinc-900 hover:bg-zinc-800 text-white';
      accentBorder = 'border-zinc-900';
      badgeBg = 'bg-zinc-200 text-zinc-800';
    } else if (page.theme === 'Bold Red') {
      themeBg = 'bg-red-50 text-red-950';
      cardBg = 'bg-white';
      btnColor = 'bg-red-600 hover:bg-red-700 text-white';
      accentBorder = 'border-red-600';
      badgeBg = 'bg-red-100 text-red-800';
    }

    return (
      <div className={`min-h-screen ${themeBg} px-4 py-8 relative transition-all duration-300`}>
        {/* Top Navbar */}
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="font-extrabold tracking-wider text-xl">Feelzone Fashion LP</span>
          </div>
          <button 
            onClick={() => setActiveLandingId(null)}
            className="flex items-center gap-2 bg-gray-500/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-500/20 transition cursor-pointer"
          >
            ← স্টোরে ফিরুন
          </button>
        </div>

        {/* Outer content container */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
          
          {/* Main Copy */}
          <div className="space-y-6">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${badgeBg}`}>
              {page.badgeText}
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
              {page.headline}
            </h1>
            <p className="text-lg opacity-90 leading-relaxed">
              {page.subheadline}
            </p>

            <div className={`p-4 rounded-xl border-l-4 ${accentBorder} ${cardBg} shadow-sm space-y-2`}>
              <h4 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> বিশেষ গ্যারান্টি
              </h4>
              <p className="text-sm opacity-80">{page.guaranteeText}</p>
            </div>

            {/* Simulated Testimonial */}
            <div className={`p-4 rounded-xl ${cardBg} shadow-sm text-sm space-y-2 italic`}>
              <div className="flex text-yellow-500 gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="opacity-95">"অর্ডার করার পরদিনই ডেলিভারি পেলাম। গুণগত মান এক কথায় অনন্য। সবাই চোখ বন্ধ করে নিতে পারেন!"</p>
              <span className="font-semibold block not-italic text-xs opacity-70">— কায়সার হামিদ, ঢাকা</span>
            </div>
          </div>

          {/* Checkout Column */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl ${cardBg} shadow-xl border border-gray-100 space-y-6`}>
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="font-bold text-xl">{product.banglaName || product.name}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-black text-red-500">৳ {product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm line-through opacity-50">৳ {product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Instant purchase order form details */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-bold text-sm text-center">দ্রুত অর্ডার করুন (ক্যাশ অন ডেলিভারি)</h4>
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="আপনার নাম" 
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <input 
                    type="tel" 
                    placeholder="১১ ডিজিটের মোবাইল নাম্বার" 
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="সম্পূর্ণ ঠিকানা" 
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={checkoutDistrict}
                      onChange={(e) => setCheckoutDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-950 border-gray-200 text-xs"
                    >
                      {BANGLADESH_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-950 border-gray-200 text-xs"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="bKash">bKash (বিকাশ)</option>
                      <option value="Nagad">Nagad (নগদ)</option>
                      <option value="Rocket">Rocket (রকেট)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
                      alert('দয়া করে আপনার নাম, মোবাইল এবং ঠিকানা দিন।');
                      return;
                    }
                    // Setup virtual cart containing this single product
                    cart.length = 0; // Wipe
                    cart.push({ product, quantity: 1 });
                    
                    if (paymentMethod === 'Cash on Delivery') {
                      completeOrder('Unpaid');
                    } else {
                      // Trigger payment gateway
                      setMfsNumber(checkoutPhone);
                      setMfsStep('number');
                      setMfsOtp('');
                      setMfsPin('');
                      if (paymentMethod === 'bKash') { setGatewayLogo('bKash'); setGatewayColor('bg-pink-600'); }
                      else if (paymentMethod === 'Nagad') { setGatewayLogo('Nagad'); setGatewayColor('bg-orange-600'); }
                      else { setGatewayLogo('Rocket'); setGatewayColor('bg-purple-700'); }
                      setShowMfsGateway(true);
                    }
                  }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-lg capitalize tracking-wide cursor-pointer text-sm ${btnColor}`}
                >
                  <ShoppingCart className="w-5 h-5" /> অর্ডার নিশ্চিত করুন →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen text-slate-800 font-sans pb-16">
      
      {/* Dynamic Landing Page Overlay IF active */}
      {activeLandingId && (
        <div className="animate-fadeIn">
          {renderLandingPage(landingPages.find(l => l.id === activeLandingId) || landingPages[0])}
        </div>
      )}

      {!activeLandingId && (
        <>
          {/* Main Header / Top Sale Bar */}
          <div className="bg-gradient-to-r from-teal-800 to-indigo-900 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 flex-wrap shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>১২ জুন পর্যন্ত বিকাশ পেমেন্টে ১০% ইনস্ট্যান্ট ফ্ল্যাট ক্যাশব্যাক! কুপন কোড: <b>FEELZONE10</b></span>
          </div>

          <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-3 md:space-y-0">
              <div className="flex justify-between items-center gap-4">
                
                {/* BRAND / LOGO (LHS) */}
                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                  <div className="bg-teal-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white shadow-md">
                    <ShoppingCart className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-2xl font-black text-teal-900 tracking-tight leading-none bg-gradient-to-r from-teal-800 to-emerald-700 bg-clip-text text-transparent">Feelzone Fashion</h1>
                    <p className="text-[9px] sm:text-xs text-gray-400 font-medium leading-none mt-1">Feelzone Fashion</p>
                  </div>
                </div>

                {/* SEARCH INPUT BAR (Desktop only, shown in middle) */}
                <div className="relative hidden md:block w-full max-w-sm lg:max-w-md">
                  <input 
                    type="text" 
                    placeholder="পণ্য বা ক্যাটাগরি দিয়ে খুঁজুন..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border bg-gray-50/50 text-gray-900 border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                </div>

                {/* RIGHT OPTIONS (Cart, Landing select, Login Button) */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Landing Pages shortcut selection */}
                  <div className="hidden lg:flex items-center gap-1.5 border border-amber-200 bg-amber-50 rounded-xl px-2.5 py-1 text-[11px] text-amber-900 font-semibold shadow-xs">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>ল্যান্ডিং পেজ:</span>
                    <select 
                      onChange={(e) => setActiveLandingId(e.target.value || null)}
                      className="bg-transparent border-none text-[11px] font-bold text-amber-950 focus:outline-none"
                      value={activeLandingId || ''}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {landingPages.map(lp => (
                        <option key={lp.id} value={lp.id}>{lp.title} ({lp.theme})</option>
                      ))}
                    </select>
                  </div>

                  {/* SHOPPING CART BUTTON */}
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 sm:p-2.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-700 rounded-xl sm:rounded-2xl transition duration-200 cursor-pointer"
                    id="checkout-cart-trigger"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold">
                        {cart.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    )}
                  </button>

                  {/* USER LOGIN BUTTON */}
                  {isLoggedIn ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[11px] font-bold text-gray-800">{userName || 'গ্রাহক'}</span>
                        <button 
                          onClick={() => {
                            setIsLoggedIn(false);
                            setUserName('');
                            triggerSystemNotification('👋 আপনি সফলভাবে লগআউট করেছেন।');
                          }}
                          className="text-[9px] font-semibold text-red-500 hover:underline"
                        >
                          লগআউট
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setIsLoggedIn(false);
                          setUserName('');
                          triggerSystemNotification('👋 আপনি সফলভাবে লগআউট করেছেন।');
                        }}
                        className="p-2 sm:p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl sm:rounded-2xl transition duration-200 flex items-center justify-center cursor-pointer"
                        title="লগআউট"
                      >
                        <User className="w-4 h-4 sm:w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowLoginModal(true);
                        setOtpSent(false);
                        setLoginPhone('');
                        setLoginOtp('');
                      }}
                      className="p-2 sm:p-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl sm:rounded-2xl transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <User className="w-4 h-4 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">লগইন</span>
                    </button>
                  )}

                </div>
              </div>

              {/* SEARCH INPUT BAR MOBILE (row below) */}
              <div className="relative block md:hidden w-full">
                <input 
                  type="text" 
                  placeholder="পণ্য বা ক্যাটাগরি দিয়ে খুঁজুন..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border bg-gray-50/50 text-gray-900 border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              </div>

            </div>
          </header>

          {/* Banner Promo Section */}
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 text-white rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
              <div className="max-w-lg space-y-4 relative z-10">
                <span className="bg-amber-400 text-teal-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  ১০০% অরগানিক ও অথেনটিক
                </span>
                <h2 className="text-3xl md:text-5xl font-black leading-tight">
                  ঘি ও মধুর অকৃত্রিম মেলবন্ধন!
                </h2>
                <p className="text-sm opacity-90 leading-relaxed">
                  সরাসরি মাঠ পর্যায় থেকে সংগৃহীত আমাদের সকল পণ্য দিচ্ছে ভেজালমুক্ত খাবারের পরিপূর্ণ নিরাপত্তা নিশ্চয়তা।
                </p>
                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => { setSelectedCategory('খাদ্য সামগ্রী'); }}
                    className="bg-white text-teal-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-md hover:bg-slate-50 transition cursor-pointer"
                  >
                    পণ্যসমূহ দেখুন
                  </button>
                  <button 
                    onClick={() => setActiveLandingId('land-1')}
                    className="bg-teal-900/40 text-white border border-white/20 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-teal-900/60 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4 text-amber-300" /> ল্যান্ডিং পেজ প্রিভিউ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filter Component */}
            <div className="lg:col-span-1 space-y-6">
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />

              {/* Free delivery features marketing card */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200/60 space-y-3">
                <Truck className="w-8 h-8 text-amber-600" />
                <h4 className="font-bold text-amber-900 text-sm">হ্যাপী কুরিয়ার ডিল</h4>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  যেকোনো ৩টি বা তার বেশি অর্ডার করলেই থাকছে সারা বাংলাদেশে ফ্রি হোম ডেলিভারি সুবিধা!
                </p>
              </div>
            </div>

            {/* Product Catalog list display */}
            <div className="lg:col-span-3 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xl sm:text-2xl text-gray-900">
                  {selectedCategory === 'All' ? 'সকল প্রডাক্টস' : selectedCategory} ({filteredProducts.length})
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white p-16 text-center rounded-2xl border border-gray-200 space-y-4">
                  <p className="text-gray-500 font-semibold">দুঃখিত, কোনো পণ্য পাওয়া যায়নি!</p>
                  <button 
                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    রিসেট ফিল্টার
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-6">
                  {filteredProducts.map(p => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg sm:rounded-2xl border border-gray-100 p-1.5 sm:p-4 space-y-2 sm:space-y-4 group shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                      key={p.id}
                      id={`customer-prod-${p.id}`}
                    >
                      <div className="space-y-1.5 sm:space-y-3">
                        <div className="relative rounded-md sm:rounded-xl overflow-hidden aspect-square bg-gray-50 border border-gray-50">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }}
                            className={`absolute top-1 right-1 sm:top-2.5 sm:right-2 p-1 sm:p-2 bg-white/80 backdrop-blur-xs shadow-xs rounded-full cursor-pointer ${
                              likedProducts[p.id] ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${likedProducts[p.id] ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div>
                          <span className="text-[7px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1 py-0.5 rounded-md">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-gray-900 text-[9px] sm:text-base mt-0.5 sm:mt-1 group-hover:text-teal-700 transition line-clamp-2 h-7 sm:h-auto min-h-[1.75rem] sm:min-h-0">
                            {p.banglaName || p.name}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-3 pt-1 sm:pt-2">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-0.5 sm:gap-1.5">
                          <div className="flex items-baseline gap-0.5 sm:gap-1">
                            <span className="font-extrabold text-teal-800 text-[10px] sm:text-xl">৳{p.price}</span>
                            {p.originalPrice && (
                              <span className="text-[7px] sm:text-xs line-through text-gray-400">৳{p.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1 sm:gap-2">
                          <button 
                            onClick={() => setSelectedProduct(p)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[8px] sm:text-xs font-bold py-1 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-xl transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
                          >
                            <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" /> বিস্তারিত
                          </button>
                          <button 
                            onClick={() => handleAddToCart(p)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[8px] sm:text-xs font-bold py-1 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-xl transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
                          >
                            কার্ট ধরুন
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* High-fidelity Brand Footer */}
          <footer className="bg-white border-t border-gray-200 mt-16 bg-gradient-to-b from-white to-gray-50 text-gray-600" id="feelzone-brand-footer">
            {/* Top benefits bar */}
            <div className="border-b border-gray-100 bg-teal-50/50 py-8">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center p-2 space-y-2">
                  <div className="bg-teal-100/80 p-3 rounded-full text-teal-700">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">দ্রুত ও নিরাপদ ডেলিভারি</h4>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">সারা বাংলাদেশে ২৪ থেকে ৭২ ঘণ্টার মধ্যে অত্যন্ত সতর্কতার সাথে হোম ডেলিভারি করুন।</p>
                </div>
                <div className="flex flex-col items-center p-2 space-y-2">
                  <div className="bg-teal-100/80 p-3 rounded-full text-teal-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">১০০% ক্যাশ অন ডেলিভারি</h4>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">পণ্য হাতে পেয়ে চেক করে নেওয়ার সম্পূর্ণ স্বাধীনতা ও নিশ্চয়তা আমাদের পক্ষ থেকে।</p>
                </div>
                <div className="flex flex-col items-center p-2 space-y-2">
                  <div className="bg-teal-100/80 p-3 rounded-full text-teal-700">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">২৪/৭ কাস্টমার সাপোর্ট</h4>
                  <p className="text-xs text-gray-550 max-w-xs leading-relaxed">যেকোনো জিজ্ঞাসা বা অর্ডারে সহযোগিতার জন্য সরাসরি যোগাযোগ করুন আমাদের হটলাইনে।</p>
                </div>
              </div>
            </div>

            {/* Main footer contents */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-teal-600 p-2 rounded-xl text-white">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-teal-950 tracking-tight">Feelzone Fashion</h2>
                    <p className="text-[10px] text-gray-400 font-bold leading-none mt-0.5">Feelzone Fashion Bangladesh</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  Feelzone Fashion বাংলাদেশের অত্যন্ত জনপ্রিয় ও আস্থাশীল অনলাইন ফ্যাশন ও শপিং প্ল্যাটফর্ম। আমরা সাশ্রয়ী মূল্যে প্রিমিয়াম মানের পণ্য সরাসরি সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।
                </p>
                <div className="space-y-2 font-medium">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>হাউজ ২৫, রোড ৩, মিরপুর ১০, ঢাকা ১২১৬, বাংলাদেশ।</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>ফিডব্যাক ও সাপোর্ট: <b>+৮৮ ০১৭০০-০০০০০</b></span>
                  </div>
                </div>
              </div>

              {/* Shopping categories Grid Option list */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-2">আমাদের ক্যাটাগরিসমূহ</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-gray-500">
                  {categories.filter(c => c !== 'All').slice(0, 5).map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => setSelectedCategory(cat)}
                        className="hover:text-teal-600 transition flex items-center gap-1 hover:translate-x-1 duration-150 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-teal-500/80" />
                        <span>{cat} কালেকশন</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button 
                      onClick={() => setSelectedCategory('All')}
                      className="hover:text-teal-600 transition flex items-center gap-1 hover:translate-x-1 duration-150 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-teal-500/80" />
                      <span>সকল পণ্য দেখুন</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Policy & Support Info */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-2">সহযোগিতা ও তথ্য</h4>
                <ul className="space-y-2 text-xs font-semibold text-gray-550 leading-relaxed">
                  <li><a href="#how-to-order" onClick={(e) => { e.preventDefault(); alert('১. যেকোনো পণ্য নির্বাচন করে "কার্ট ধরুন" বাটনে ক্লিক করুন।\n২. নিচে কার্ট বক্সে যান, নাম ও মোবাইল দিন।\n৩. অর্ডার নিশ্চিত করুন ক্লিক করুন!'); }} className="hover:text-teal-600 transition block">কিভাবে অর্ডার করবেন?</a></li>
                  <li><a href="#return-refund" onClick={(e) => { e.preventDefault(); alert('ডেলিভারি গ্রহণের সময় পণ্য যাচাই করে নিন। ত্রুটিযুক্ত পণ্য সাথে সাথে ফেরত পাঠাতে পারবেন কোনো ডেলিভারি চার্জ ছাড়া!'); }} className="hover:text-teal-600 transition block">৭ দিনের সহজ রিটার্ন পলিসি</a></li>
                  <li><a href="#support" onClick={(e) => { e.preventDefault(); alert('২৪ ঘণ্টা সাপোর্ট পেতে কল করুন: +৮৮ ০১৭০০-০০০০০ অথবা এডমিন প্যানেলে টিকিট খুলুন। ধন্যবাদ!'); }} className="hover:text-teal-600 transition block">সাপোর্ট সেন্টার ও টিকিট</a></li>
                  <li><b className="text-gray-900 block mt-2">অফিস সময়সূচী:</b> শনি - বৃহস্পতি (সকাল ৯:০০ টা - রাত ৮:০০ টা)</li>
                </ul>
              </div>

              {/* Payments & Security Badges column */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-gray-900 border-b border-gray-100 pb-2">নিরাপদ পেমেন্ট পার্টনার</h4>
                <p className="text-xs text-gray-550 leading-relaxed">
                  মোবাইল ব্যাংকিং অথবা ক্যাশ অন ডেলিভারির মাধ্যমে সম্পূর্ণ নিরাপদে পেমেন্ট সম্পন্ন করুন।
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-pink-50 border border-pink-100 p-2 rounded-xl flex items-center justify-center font-bold text-pink-600 text-[10px] shadow-2xs">বিকাশ</div>
                  <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex items-center justify-center font-bold text-orange-600 text-[10px] shadow-2xs">নগদ</div>
                  <div className="bg-purple-50 border border-purple-100 p-2 rounded-xl flex items-center justify-center font-bold text-purple-700 text-[10px] shadow-2xs">রকেট</div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center justify-center font-bold text-slate-700 text-[10px] shadow-2xs">ভিসা</div>
                  <div className="bg-teal-50 border border-teal-100 p-2 rounded-xl flex items-center justify-center font-bold text-teal-850 text-[10px] shadow-2xs col-span-2">নিরাপদ গেটওয়ে</div>
                </div>
                <div className="bg-teal-50 border border-teal-100/60 rounded-xl p-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-[10px] text-teal-900 font-bold leading-tight">SSL 256-bit এনক্রিপশন দ্বারা সম্পূর্ণ সুরক্ষিত কেনাকাটা</span>
                </div>
              </div>
            </div>

            {/* Copyright layout bar */}
            <div className="border-t border-gray-100 bg-gray-50/50 py-4 text-center">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-gray-450 font-medium">
                <p>© ২০২৬ Feelzone Fashion লিমিটেড। সর্বস্বত্ব সংরক্ষিত।</p>
                <div className="flex gap-4">
                  <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Feelzone Fashion ব্যবহারে আপনি আমাদের নিয়মনীতি ও প্রাইভেসী পলিসি মেনে নিয়েছেন।'); }} className="hover:text-teal-600 transition">ব্যবহারের শর্তাবলী</a>
                  <span>|</span>
                  <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('আপনার অ্যাকাউন্টের গোপনীয়তা নিশ্চিত করতে আমরা সর্বদা সচেষ্ট।'); }} className="hover:text-teal-600 transition">প্রাইভেসী পলিসি</a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Product Information Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 bg-white/70 p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gray-50 aspect-square md:aspect-auto md:h-full relative">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-teal-600 tracking-wide bg-teal-50 px-2.5 py-1 rounded-sm">
                        {selectedProduct.category}
                      </span>
                      <h3 className="font-extrabold text-xl text-gray-900 mt-2">{selectedProduct.banglaName || selectedProduct.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">SKU: {selectedProduct.sku}</p>
                    </div>



                    <p className="text-sm text-gray-500 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t">
                    <div className="flex gap-4 items-baseline">
                      <span className="text-3xl font-black text-teal-800">৳{selectedProduct.price}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-sm line-through text-gray-400">৳{selectedProduct.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          handleAddToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" /> কার্টে যোগ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl justify-between"
              id="shopping-cart-drawer"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                  <h3 className="font-black text-gray-800">শপিং কার্ট</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="text-gray-500 text-sm font-semibold">আপনার কার্টটি সম্পূর্ণ খালি!</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="bg-teal-600 text-white text-xs px-4 py-2 rounded-xl transition"
                    >
                      কেনাকাটা করুন
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div className="flex gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 items-center justify-between" key={item.product.id}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden border bg-white flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-950 truncate">
                          {item.product.banglaName || item.product.name}
                        </h4>
                        <p className="text-xs text-teal-700 font-extrabold mt-1">৳{item.product.price}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="bg-white hover:bg-gray-100 border text-xs w-6 h-6 flex items-center justify-center rounded-lg"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.product.id, +1)}
                            className="bg-white hover:bg-gray-100 border text-xs w-6 h-6 flex items-center justify-center rounded-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] bg-gray-50">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>সর্বমোট মূল্য:</span>
                    <span className="text-xl font-black text-teal-800">৳{getCartTotal()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">ডেলিভারি চার্জ ও ভ্যাট সহ বিস্তারিত চেকআউট পাতায় দেখানো হবে।</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => {
                        setIsCheckingOut(true);
                        setIsCartOpen(false);
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      চেকআউট পাতায় যান <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout details Modal Overlay */}
      <AnimatePresence>
        {isCheckingOut && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsCheckingOut(false)}
                className="absolute top-4 right-4 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-teal-600" />
                <h3 className="text-xl font-black text-gray-900">অর্ডার চেকআউট ফরম</h3>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact info */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">আপনার আইডেন্টিটি নাম *</label>
                  <input 
                    type="text" 
                    placeholder="উদা: রাকিব হাসান" 
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">মোবাইল নাম্বার *</label>
                  <input 
                    type="tel" 
                    placeholder="উদা: 01712345678" 
                    required
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">জেলা (কুরিয়ার এরিয়া) *</label>
                  <select
                    value={checkoutDistrict}
                    onChange={(e) => setCheckoutDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-950 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  >
                    {BANGLADESH_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-600 block">পূর্ণাঙ্গ ঠিকানা *</label>
                  <textarea 
                    placeholder="রোড নং, হাউজ নং, এলাকা বা থানা উল্লেখ করুন" 
                    required
                    rows={2}
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                  ></textarea>
                </div>

                {/* Gateway Mode selection */}
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-600 block">পেমেন্ট মেথড নির্বাচন করুন *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'Cash on Delivery', label: 'ক্যাশ অন ডেলিভারি (COD)' },
                      { id: 'bKash', label: 'বিকাশ (bKash) পেমেন্ট' },
                      { id: 'Nagad', label: 'নগদ (Nagad) পেমেন্ট' },
                      { id: 'Rocket', label: 'রকেট (Rocket) পেমেন্ট' }
                    ].map(method => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          paymentMethod === method.id 
                            ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs' 
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart pricing overview inside checkout */}
                <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>প্রোডাক্ট সংখ্যা:</span>
                    <span className="font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} টি</span>
                  </div>
                  <div className="flex justify-between">
                    <span>পণ্যমূল্য:</span>
                    <span className="font-bold text-gray-900">৳{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold text-gray-900">৳{checkoutDistrict === 'Dhaka' ? 60 : 120}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-teal-900 border-t pt-2 mt-2">
                    <span>মোট প্রদেয় বিল:</span>
                    <span>৳{getCartTotal() + (checkoutDistrict === 'Dhaka' ? 60 : 120)}</span>
                  </div>
                </div>

                <div className="col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    অর্ডার কনফার্ম করুন <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Mobile Payment Gateway Dialog Simulation (bKash/Nagad/Rocket look & feel) */}
      <AnimatePresence>
        {showMfsGateway && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xs md:max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Header gateway bar */}
              <div className={`${gatewayColor} p-4 text-white text-center font-bold tracking-widest relative`}>
                <span className="text-white text-lg font-black">{gatewayLogo} Payment Console</span>
                <button 
                  onClick={() => setShowMfsGateway(false)}
                  className="absolute right-4 top-4 hover:bg-black/10 p-1 rounded"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Interactive payment terminal body */}
              <div className="p-6 md:p-8 space-y-6 text-center text-slate-800">
                <div className="bg-gray-50 border p-3 border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500">Merchant: Feelzone Fashion Ltd</p>
                  <p className="text-xl font-bold text-gray-800">Amount: ৳{getCartTotal() + (checkoutDistrict === 'Dhaka' ? 60 : 120)}</p>
                </div>

                {mfsStep === 'number' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-600">Enter your {gatewayLogo} account number (11-digit):</p>
                    <input 
                      type="tel" 
                      placeholder="e.g. 017XXXXXXXX"
                      value={mfsNumber}
                      onChange={(e) => setMfsNumber(e.target.value)}
                      maxLength={11}
                      className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-2 border rounded-xl focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400">By clicking agree, you authorize Feelzone Fashion to simulate charging your purse during testing.</p>
                  </div>
                )}

                {mfsStep === 'otp' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-600">Verification OTP has been sent via Simulated SMS. Enter code (any 4 digits):</p>
                    <input 
                      type="password" 
                      placeholder="XXXX"
                      value={mfsOtp}
                      onChange={(e) => setMfsOtp(e.target.value)}
                      maxLength={4}
                      className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-2 border rounded-xl focus:outline-none"
                    />
                    <p className="text-[10px] text-orange-600 font-bold">টেস্ট মোড: আপনার পছন্দের যেকোনো ৪ ডিজিট দিলেই হবে।</p>
                  </div>
                )}

                {mfsStep === 'pin' && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-600">Enter your secure {gatewayLogo} PIN (any 4 digits):</p>
                    <input 
                      type="password" 
                      placeholder="●●●●"
                      value={mfsPin}
                      onChange={(e) => setMfsPin(e.target.value)}
                      maxLength={4}
                      className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-2 border rounded-xl focus:outline-none"
                    />
                    <p className="text-[10px] text-orange-600 font-bold">ডেমো গেটওয়ে: পিন সংকেত সম্পূর্ণ সুরক্ষিত ও টেস্ট স্ক্রিনে সীমাবদ্ধ।</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowMfsGateway(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={verifyMfsGateway}
                    className={`flex-1 text-white py-2 rounded-xl text-xs font-extrabold ${gatewayColor}`}
                  >
                    {mfsStep === 'number' ? 'Proceed' : mfsStep === 'otp' ? 'Verify OTP' : 'Pay Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Complete Success & Downloadable Receipt Invoice modal */}
      <AnimatePresence>
        {recentOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">ধন্যবাদ! আপনার অর্ডার সফল হয়েছে</h3>
                <p className="text-xs text-gray-500">আপনার অর্ডার আইডি: <span className="font-bold text-teal-700 font-mono">{recentOrder.id}</span></p>
              </div>

              {/* Invoice Layout representation inside success box */}
              <div className="p-5 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl space-y-4 text-xs font-mono">
                <div className="text-center font-bold pb-2 border-b">
                  <p className="text-sm">Feelzone Fashion Retail Invoice</p>
                  <p className="text-[10px] font-normal text-gray-400">Date: {new Date(recentOrder.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="space-y-1">
                  <p>Customer: {recentOrder.customerName}</p>
                  <p>Phone: {recentOrder.phone}</p>
                  <p>Address: {recentOrder.address}, {recentOrder.district}</p>
                </div>

                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between font-bold text-[10px] text-gray-400 uppercase">
                    <span>Item</span>
                    <span>Qty x Rate = Total</span>
                  </div>
                  {recentOrder.items.map((it, idx) => (
                    <div className="flex justify-between" key={idx}>
                      <span className="truncate max-w-[150px]">{it.product.banglaName || it.product.name}</span>
                      <span>{it.quantity} x ৳{it.product.price} = ৳{it.quantity * it.product.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2 space-y-1 font-bold">
                  <div className="flex justify-between text-xs font-black text-teal-900">
                    <span>Total Bill paid via {recentOrder.paymentMethod}:</span>
                    <span>৳{recentOrder.totalAmount + (recentOrder.district === 'Dhaka' ? 60 : 120)}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-normal mt-1 italic">Note: Live Tracking link with Courier will be shared shortly over Simulated SMS!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Simulated Invoice download alert
                    alert(`ডাউনলোড হচ্ছে: ${recentOrder.id}-Invoice.pdf`);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"
                >
                  <Download className="w-4 h-4" /> ইনভয়েস ডাউনলোড
                </button>
                <button 
                  onClick={() => setRecentOrder(null)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-xs"
                >
                  ট্যাক্স রিসিট বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Login Modal Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative border border-gray-100"
              id="customer-login-modal"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <User className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-gray-950">কাস্টমার অ্যাকাউন্ট লগইন</h3>
                <p className="text-xs text-gray-500 leading-relaxed">সহজ ও নিরাপদ কেনাকাটার জন্য আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">মোবাইল নাম্বার</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        required
                        placeholder="আপনার ১১ ডিজিটের মোবাইল নাম্বার দিন" 
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                      <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">উদাহরণ: 01712345678 বা আপনার যেকোনো নাম্বার</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl">
                      <p className="text-[11px] text-teal-800 font-semibold leading-relaxed">
                        আমরা আপনার নাম্বারে <span className="font-bold font-mono text-teal-900">{loginPhone}</span> ওটিপি কোড পাঠিয়েছি। লগইন সম্পন্ন করতে ডেমো কোডটি ব্যবহার করুন।
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">ওটিপি কোড (OTP Code)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="১ ২৩ ৪" 
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        className="w-full text-center py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-sm font-black font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-600"
                        maxLength={4}
                      />
                      <p className="text-[10px] text-amber-600 font-bold text-center">টেস্ট ডেমো ওটিপি কোড: <b className="font-mono text-xs">1234</b></p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      if (otpSent) {
                        setOtpSent(false);
                      } else {
                        setShowLoginModal(false);
                      }
                    }}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition border border-gray-200"
                  >
                    {otpSent ? 'পেছনে ফিরুন' : 'বন্ধ করুন'}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer"
                  >
                    {otpSent ? 'নিশ্চিত করুন' : 'ওটিপি পাঠান'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
