import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShoppingCart, Star, Trash2, Check, ArrowRight, ShieldCheck, 
  X, Phone, MapPin, Truck, Download, Sparkles, Heart, Bell, Eye, Grid3X3, Smartphone, User, LogOut,
  MessageCircle, Lock, ShoppingBag, Gift, MessageSquare, Settings, CreditCard, Share2, Link
} from 'lucide-react';
import { Product, Order, LandingPage, LandingPageTheme, Category } from '../types';
import { BANGLADESH_DISTRICTS } from '../data';
import CategoryFilter from './Category/CategoryFilter';
import PromoBanner from './Banner/PromoBanner';

const BkashLogo = () => (
  <svg viewBox="0 0 100 28" className="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5,22 14,3 21,16" fill="#E2136E" />
    <polygon points="21,16 29,11 25,22" fill="#B30E53" />
    <polygon points="5,22 21,16 16,25" fill="#C9115E" />
    <polygon points="16,25 21,16 25,22" fill="#E2136E" />
    <polygon points="25,22 29,11 31,16" fill="#E2136E" />
    <text x="35" y="19" fill="#E2136E" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif">bKash</text>
  </svg>
);

const NagadLogo = () => (
  <svg viewBox="0 0 100 28" className="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5,18 C8,8 14,8 17,16 C20,24 26,24 29,10 L26,8 C23,19 19,19 16,11 C13,3 7,3 3,13 Z" fill="#F47621" />
    <circle cx="16" cy="5" r="2.5" fill="#F05A24" />
    <circle cx="20" cy="9" r="2" fill="#FFC20E" />
    <text x="33" y="19" fill="#F47621" fontSize="13" fontWeight="900" fontFamily="system-ui, sans-serif">nagad</text>
  </svg>
);

const RocketLogo = () => (
  <svg viewBox="0 0 100 28" className="h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="14" r="9" fill="#8C3494" />
    <path d="M12,8 L15,13 L12,12 L9,13 Z" fill="white" />
    <path d="M11.3,12 L12.7,12 L12,16 Z" fill="white" />
    <path d="M12,16 L12.7,19 L12,18 L11.3,19 Z" fill="#F47621" />
    <text x="25" y="19" fill="#8C3494" fontSize="12" fontWeight="900" fontFamily="system-ui, sans-serif">Rocket</text>
  </svg>
);

interface CustomerStoreProps {
  products: Product[];
  landingPages: LandingPage[];
  onNewOrder: (order: Order) => void;
  triggerSystemNotification: (message: string) => void;
  activeLandingId: string | null;
  setActiveLandingId: (id: string | null) => void;
  emptyCategories?: Category[];
  onAdminViewClick?: () => void;
  orders?: Order[];
}

export default function CustomerStore({
  products,
  landingPages,
  onNewOrder,
  triggerSystemNotification,
  activeLandingId,
  setActiveLandingId,
  emptyCategories = [],
  onAdminViewClick,
  orders = [],
}: CustomerStoreProps) {
  // Navigation & UI States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProductImage, setActiveProductImage] = useState<string>('');

  React.useEffect(() => {
    if (selectedProduct) {
      setActiveProductImage(selectedProduct.image);
    } else {
      setActiveProductImage('');
    }
  }, [selectedProduct]);

  // 🔗 URL Routing & Synchronization (Category folders and product deep linking)
  React.useEffect(() => {
    if (!products || products.length === 0) return;

    const parseUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      const safeDecode = (str: string) => {
        try {
          return decodeURIComponent(str);
        } catch {
          return str;
        }
      };

      let categoryFromUrl = '';
      let productFromUrl = '';

      // Format 1: Hash routing (Guarantees fallback and multi-tab works perfectly everywhere without Nginx 404)
      if (hash.startsWith('#/')) {
        const hashParts = hash.substring(2).split('/').filter(Boolean);
        const hCatIdx = hashParts.indexOf('category');
        const hProdIdx = hashParts.indexOf('product');
        if (hCatIdx !== -1 && hashParts[hCatIdx + 1]) {
          categoryFromUrl = safeDecode(hashParts[hCatIdx + 1]);
        }
        if (hProdIdx !== -1 && hashParts[hProdIdx + 1]) {
          productFromUrl = safeDecode(hashParts[hProdIdx + 1]);
        }
      }

      // Format 2: Pathname routing fallback
      if (!categoryFromUrl) {
        const pathParts = path.split('/').filter(Boolean);
        const catIdx = pathParts.indexOf('category');
        const prodIdx = pathParts.indexOf('product');

        if (catIdx !== -1 && pathParts[catIdx + 1]) {
          categoryFromUrl = safeDecode(pathParts[catIdx + 1]);
        }
        if (prodIdx !== -1 && pathParts[prodIdx + 1]) {
          productFromUrl = safeDecode(pathParts[prodIdx + 1]);
        }
      }

      // Format 3: Search Query parameters fallback
      if (!categoryFromUrl && searchParams.has('category')) {
        categoryFromUrl = searchParams.get('category') || '';
      }
      if (!productFromUrl && searchParams.has('product')) {
        productFromUrl = searchParams.get('product') || '';
      }

      // Match category
      if (categoryFromUrl) {
        const availableCats = ['All', ...Array.from(new Set(products.map(p => p.category)))];
        const matched = availableCats.find(
          c => c.toLowerCase() === categoryFromUrl.toLowerCase() || c === categoryFromUrl
        );
        if (matched) {
          setSelectedCategory(matched);
        }
      } else {
        if (hash === '#/' || hash === '#') {
          setSelectedCategory('All');
        }
      }

      // Match product
      if (productFromUrl) {
        const matchedProd = products.find(
          p => p.id === productFromUrl || p.name.toLowerCase() === productFromUrl.toLowerCase()
        );
        if (matchedProd) {
          setSelectedProduct(matchedProd);
        }
      } else {
        // Only reset if hash isn't displaying a product
        if (hash && !hash.includes('/product/')) {
          setSelectedProduct(null);
        }
      }
    };

    parseUrlRoute();

    // Listen to hashchange and back/forward navigation
    window.addEventListener('hashchange', parseUrlRoute);
    window.addEventListener('popstate', parseUrlRoute);
    return () => {
      window.removeEventListener('hashchange', parseUrlRoute);
      window.removeEventListener('popstate', parseUrlRoute);
    };
  }, [products]);

  // Synchronize state down to current browser URL using safe, portable Hash Routing
  React.useEffect(() => {
    if (!products || products.length === 0) return;

    let targetHash = '#/';
    if (selectedCategory && selectedCategory !== 'All') {
      targetHash += `category/${encodeURIComponent(selectedCategory)}`;
      if (selectedProduct) {
        targetHash += `/product/${encodeURIComponent(selectedProduct.id)}`;
      }
    } else if (selectedProduct) {
      targetHash += `category/${encodeURIComponent(selectedProduct.category)}/product/${encodeURIComponent(selectedProduct.id)}`;
    }

    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
    const nextUrl = '/' + targetHash; // Resolves to "/#/category/..." preserving root domain index retrieval

    try {
      if (currentUrl !== nextUrl) {
        window.history.pushState(
          { category: selectedCategory, product: selectedProduct?.id },
          '',
          nextUrl
        );
      }
    } catch {
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }, [selectedCategory, selectedProduct, products]);

  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  
  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutName, setCheckoutName] = useState(() => {
    try {
      return localStorage.getItem('cust_userName') || 'বাদল হোসাইন';
    } catch {
      return 'বাদল হোসাইন';
    }
  });
  const [checkoutPhone, setCheckoutPhone] = useState(() => {
    try {
      return localStorage.getItem('cust_userPhone') || '';
    } catch {
      return '';
    }
  });
  const [checkoutAddress, setCheckoutAddress] = useState(() => {
    try {
      return localStorage.getItem('cust_addressHome') || '';
    } catch {
      return '';
    }
  });
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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('cust_isLoggedIn') === 'true';
    } catch {
      return false;
    }
  });
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('cust_userName') || '';
    } catch {
      return '';
    }
  });
  const [userPhone, setUserPhone] = useState(() => {
    try {
      return localStorage.getItem('cust_userPhone') || '';
    } catch {
      return '';
    }
  });

  // Sync state with login changes
  React.useEffect(() => {
    if (isLoggedIn) {
      if (userName) setCheckoutName(userName);
      if (userPhone) setCheckoutPhone(userPhone);
      const savedAddr = localStorage.getItem('cust_addressHome');
      if (savedAddr) setCheckoutAddress(savedAddr);
    }
  }, [isLoggedIn, userName, userPhone]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');

  // Customer Profile Tab State and profile data
  const [profileActiveTab, setProfileActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'address' | 'payments' | 'coupons' | 'notifications' | 'password' | 'support' | 'settings'>('profile');
  
  // Custom states for Profile, Address, Password updates (stored in localStorage)
  const [profileEmail, setProfileEmail] = useState(() => localStorage.getItem('cust_profileEmail') || '');
  const [profileGender, setProfileGender] = useState(() => localStorage.getItem('cust_profileGender') || 'Male');
  const [profileDob, setProfileDob] = useState(() => localStorage.getItem('cust_profileDob') || '');
  
  const [addressHome, setAddressHome] = useState(() => localStorage.getItem('cust_addressHome') || 'ব্যাংক কলোনী, সাভার, ঢাকা।');
  const [addressCity, setAddressCity] = useState(() => localStorage.getItem('cust_addressCity') || 'Savar');
  const [addressDistrict, setAddressDistrict] = useState(() => localStorage.getItem('cust_addressDistrict') || 'Dhaka');
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) {
      alert('অনুগ্রহ করে আপনার নাম দিন');
      return;
    }
    if (!loginPhone || loginPhone.length < 11) {
      alert('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
      return;
    }
    
    const targetName = loginName.trim();
    const targetPhone = loginPhone.trim();

    setIsLoggedIn(true);
    setUserName(targetName);
    setUserPhone(targetPhone);
    setCheckoutName(targetName);
    setCheckoutPhone(targetPhone);

    try {
      localStorage.setItem('cust_isLoggedIn', 'true');
      localStorage.setItem('cust_userName', targetName);
      localStorage.setItem('cust_userPhone', targetPhone);
      // Initialize basic email/address if not set yet
      if (!localStorage.getItem('cust_addressHome')) {
        localStorage.setItem('cust_addressHome', 'ব্যাংক কলোনী, সাভার, ঢাকা।');
      }
    } catch (err) {
      console.error('localStorage save failed', err);
    }

    setShowLoginModal(false);
    triggerSystemNotification('🎉 আপনার অ্যাকাউন্ট রেজিস্ট্রেশন ও সাইন ইন সফল হয়েছে!');
  };

  // Filter Categories
  const categories = ['All', ...Array.from(new Set([
    ...products.map(p => p.category),
    ...emptyCategories.map(c => typeof c === 'string' ? c : c?.name || '')
  ].filter(Boolean)))];

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
            <span className="font-extrabold tracking-wider text-xl">FeelZone Fashion LP</span>
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
                    placeholder="আপনার নাম (উদা: বাদল হোসাইন)" 
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

          <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-3 md:space-y-0">
              <div className="flex justify-between items-center gap-4">
                
                {/* BRAND / LOGO (LHS) */}
                <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
                  <div className="bg-teal-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white shadow-md">
                    <ShoppingCart className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-2xl font-black text-teal-900 tracking-tight leading-none bg-gradient-to-r from-teal-800 to-emerald-700 bg-clip-text text-transparent">FeelZone Fashion</h1>
                    <p className="text-[9px] sm:text-xs text-gray-400 font-medium leading-none mt-1">FeelZone Customized Art & Frames</p>
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
                  
                  {/* ADMIN PANELS QUICK ACCESS */}
                  {onAdminViewClick && (
                    <button 
                      onClick={onAdminViewClick}
                      className="p-2 sm:p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-850 hover:text-white text-xs font-black rounded-xl sm:rounded-2xl transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="অ্যাডমিন প্যানেল লগইন"
                    >
                      <Lock className="w-4 h-4 text-teal-400 stroke-[2.5]" />
                      <span className="hidden sm:inline text-teal-400 font-extrabold">অ্যাডমিন</span>
                    </button>
                  )}

                  {/* USER LOGIN BUTTON */}
                  {isLoggedIn ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[11px] font-bold text-gray-800">{userName || 'গ্রাহক'}</span>
                        <button 
                          onClick={() => {
                            setShowProfileModal(true);
                          }}
                          className="text-[9px] font-bold text-teal-600 hover:underline text-left cursor-pointer"
                        >
                          প্রোফাইল ওপেন করুন
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setShowProfileModal(true);
                        }}
                        className="p-2 sm:p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl sm:rounded-2xl transition duration-200 flex items-center justify-center cursor-pointer relative"
                        title="কাস্টমার প্রোফাইল"
                      >
                        <User className="w-4 h-4 sm:w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowLoginModal(true);
                        setLoginPhone('');
                        setLoginName('');
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
          <PromoBanner 
            setSelectedCategory={setSelectedCategory}
            setActiveLandingId={setActiveLandingId}
          />

          {/* Popular Categories visual section (highly polished circular design matching user request) */}
          <div className="max-w-7xl mx-auto px-4 pt-10 pb-2" id="popular-categories-row-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Popular Categories / জনপ্রিয় ক্যাটাগরিসমূহ
              </h2>
              {selectedCategory !== 'All' && (
                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                >
                  সব পণ্য দেখুন →
                </button>
              )}
            </div>
            
            {/* Horizontal scroll container with custom scrollbar, or flex wrap on big screens */}
            <div className="flex items-start gap-4 sm:gap-8 overflow-x-auto pb-4 pt-1 justify-start md:flex-wrap md:overflow-visible scrollbar-none">
              {categories.map(cat => {
                // Find custom image if specified by admin
                const matchedEmptyCat = emptyCategories?.find(c => 
                  (typeof c === 'string' ? c : c?.name || '').toLowerCase() === cat.toLowerCase()
                );
                const customImage = typeof matchedEmptyCat === 'object' && matchedEmptyCat ? matchedEmptyCat.image : undefined;

                // Find a representative product image for this category
                const catProducts = products.filter(p => p.category === cat);
                let catImg = '';
                if (cat === 'All') {
                  catImg = products[0]?.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60';
                } else if (customImage && customImage.trim() !== '') {
                  catImg = customImage.trim();
                } else if (catProducts.length > 0) {
                  catImg = catProducts[0].image;
                } else {
                  catImg = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60';
                }

                const matchesCatCount = cat === 'All' ? products.length : catProducts.length;
                const isSelected = selectedCategory === cat;
                const banglaLabel = cat === 'All' ? 'সব পণ্য' : cat;

                return (
                  <motion.button
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex flex-col items-center text-center gap-2.5 min-w-[90px] sm:min-w-[110px] max-w-[125px] group cursor-pointer focus:outline-none focus:ring-0 active:scale-95"
                    id={`popular-cat-${cat.replace(/\s/g, '-')}`}
                  >
                    {/* Circle wrapper */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition duration-300 relative shadow-xs p-1.5 ${
                      isSelected 
                        ? 'bg-teal-50 border-2 border-teal-500 scale-105 shadow-md shadow-teal-100' 
                        : 'bg-zinc-100/70 border border-transparent hover:border-teal-400 hover:shadow-xs group-hover:bg-slate-100'
                    }`}>
                      <img
                        src={catImg}
                        alt={cat}
                        className="w-full h-full object-cover rounded-full select-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Text Label */}
                    <div className="flex flex-col items-center justify-center space-y-0.5">
                      <span className={`text-[11px] sm:text-xs md:text-sm font-bold tracking-tight line-clamp-2 leading-tight transition-colors duration-200 ${
                        isSelected ? 'text-teal-700 font-extrabold' : 'text-gray-900 group-hover:text-teal-600'
                      }`}>
                        {banglaLabel}
                      </span>
                      <span className="text-[9px] text-gray-400 font-medium font-mono">
                        ({matchesCatCount} টি)
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            
            {/* Free delivery features marketing banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-200/40 flex flex-col sm:flex-row items-start sm:items-center gap-4" id="free-delivery-marketing-banner">
              <div className="bg-amber-105 p-2.5 rounded-xl text-amber-700 bg-amber-100 flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-900 text-xs sm:text-sm">হ্যাপী কুরিয়ার ডিল: ৩টি বা তার বেশি প্রডাক্ট কিনলে কুরিয়ার সম্পূর্ণ ফ্রি!</h4>
                <p className="text-[10px] sm:text-xs text-amber-800/90 leading-relaxed mt-0.5">
                  যেকোনো ৩টি বা তার বেশি অর্ডার করলেই থাকছে সারা বাংলাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি সুবিধা!
                </p>
              </div>
            </div>

            {/* Product Catalog list display */}
            <div className="space-y-8" id="product-catalog-listing-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <h3 className="font-black text-xl sm:text-2xl text-rose-900 md:text-gray-900 flex items-center gap-2">
                  <span>{selectedCategory === 'All' ? 'সকল প্রডাক্টস' : selectedCategory} ({filteredProducts.length})</span>
                </h3>

                {/* Category Share & Copy Link button */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ক্যাটাগরি লিংক:</span>
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs max-w-full overflow-hidden">
                    <code className="text-[10px] font-mono text-teal-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px] sm:max-w-[240px]">
                      {`${window.location.origin}/#/category/${encodeURIComponent(selectedCategory)}`}
                    </code>
                    <button 
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/#/category/${encodeURIComponent(selectedCategory)}`;
                        navigator.clipboard.writeText(url).then(() => {
                          triggerSystemNotification("📋 ক্যাটাগরি শেয়ারিং লিংক কপি করা হয়েছে!");
                        }).catch(() => {
                          const textArea = document.createElement("textarea");
                          textArea.value = url;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand("copy");
                          document.body.removeChild(textArea);
                          triggerSystemNotification("📋 ক্যাটাগরি শেয়ারিং লিংক কপি করা হয়েছে!");
                        });
                      }}
                      className="hover:bg-teal-50 text-teal-600 p-1 rounded-lg transition shrink-0 cursor-pointer flex items-center justify-center"
                      title="ক্যাটাগরি লিংক কপি করুন"
                    >
                      <Link className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map(p => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg sm:rounded-2xl border border-gray-100 p-2 sm:p-4 space-y-3 group shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                      key={p.id}
                      id={`customer-prod-${p.id}`}
                    >
                      <div className="space-y-2 sm:space-y-3 flex-1 flex flex-col">
                        <div 
                          onClick={() => setSelectedProduct(p)}
                          className="relative rounded-md sm:rounded-xl overflow-hidden aspect-square bg-gray-50 border border-gray-50 cursor-pointer"
                        >
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

                        <div 
                          onClick={() => setSelectedProduct(p)}
                          className="cursor-pointer space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-start"
                        >
                          <h4 className="font-bold text-gray-900 text-xs sm:text-base group-hover:text-teal-700 transition line-clamp-2 leading-snug">
                            {p.banglaName || p.name}
                          </h4>
                          
                          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-auto">
                            <span className="font-extrabold text-teal-850 text-xs sm:text-xl">৳{p.price}</span>
                            {p.originalPrice && (
                              <span className="text-[9px] sm:text-xs line-through text-gray-400">৳{p.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 sm:space-y-2 pt-2 border-t border-gray-50">
                        {/* Buy Now Button (Replaces "বিস্তারিত") */}
                        <button 
                          onClick={() => {
                            if (!cart.some(item => item.product.id === p.id)) {
                              handleAddToCart(p, 1);
                            }
                            setIsCheckingOut(true);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          id={`buy-now-${p.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> অর্ডার
                        </button>

                        {/* Cart & Chat buttons side-by-side */}
                        <div className="grid grid-cols-2 gap-1">
                          <button 
                            onClick={() => handleAddToCart(p)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[8px] sm:text-[11px] font-bold py-1 sm:py-1.5 px-0.5 sm:px-1.5 rounded-md sm:rounded-lg transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
                            id={`add-to-cart-${p.id}`}
                          >
                            কার্ট ধরুন
                          </button>
                          
                          <a 
                            href={`https://wa.me/8801707019349?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি "${p.banglaName || p.name}" প্রোডাক্টটি কিনতে আগ্রহী। মূল্য: ৳${p.price}।`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] sm:text-[11px] font-bold py-1 sm:py-1.5 px-0.5 sm:px-1.5 rounded-md sm:rounded-lg transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer text-center"
                            id={`chat-whatsapp-${p.id}`}
                          >
                            <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> চ্যাট
                          </a>
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
                    <h2 className="text-lg font-black text-teal-950 tracking-tight">FeelZone Fashion</h2>
                    <p className="text-[10px] text-gray-400 font-bold leading-none mt-0.5">FeelZone Photo Frames Bangladesh</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  FeelZone Fashion বাংলাদেশের অত্যন্ত জনপ্রিয় ও আস্থাশীল অনলাইন কাস্টমাইজড ফটো ফ্রেম ও প্রিমিয়াম আর্ট গ্যালারি প্ল্যাটফর্ম। আমরা সাশ্রয়ী মূল্যে সেরা ডিজাইনের দৃষ্টিনন্দন উপহার সামগ্রী সরাসরি সরবরাহ করতে প্রতিশ্রুতিবদ্ধ।
                </p>
                <div className="space-y-2 font-medium">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>ব্যাংক কলোনী, সাভার, ঢাকা।</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>ফিডব্যাক ও সাপোর্ট: <b>০১৭০৭০১৯৩৪৯</b></span>
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
                  <li><a href="#support" onClick={(e) => { e.preventDefault(); alert('২৪ ঘণ্টা সাপোর্ট পেতে কল করুন: ০১৭০৭০১৯৩৪৯ অথবা এডমিন প্যানেলে টিকিট খুলুন। ধন্যবাদ!'); }} className="hover:text-teal-600 transition block">সাপোর্ট সেন্টার ও টিকিট</a></li>
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
                <p>© ২০২৬ FeelZone Fashion লিমিটেড। সর্বস্বত্ব সংরক্ষিত।</p>
                <div className="flex gap-4">
                  <a href="#terms" onClick={(e) => { e.preventDefault(); alert('FeelZone Fashion ব্যবহারে আপনি আমাদের নিয়মনীতি ও প্রাইভেসী পলিসি মেনে নিয়েছেন।'); }} className="hover:text-teal-600 transition">ব্যবহারের শর্তাবলী</a>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-[96%] xs:max-w-md sm:max-w-lg md:max-w-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col font-sans"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-xs p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition shadow-md border border-gray-100"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto flex-1">
                <div className="bg-gray-50 p-2 sm:p-3 relative flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 relative overflow-hidden rounded-xl bg-gray-100 max-h-[350px] md:max-h-full">
                    <img 
                      src={activeProductImage || selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover rounded-xl" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Multiple image thumbnails */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-2 px-0.5 scrollbar-thin scrollbar-thumb-teal-500 shrink-0 select-none mt-2">
                      {selectedProduct.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveProductImage(imgUrl)}
                          className={`w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden border-2 transition duration-200 ${
                            (activeProductImage || selectedProduct.image) === imgUrl
                              ? 'border-teal-600 scale-105 shadow-sm'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 flex flex-col justify-between">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-teal-600 tracking-wider bg-teal-50 px-2 py-0.5 rounded-sm">
                        {selectedProduct.category}
                      </span>
                      <h3 className="font-extrabold text-base sm:text-xl text-gray-900 mt-1.5 sm:mt-2 leading-snug">
                        {selectedProduct.banglaName || selectedProduct.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">SKU: {selectedProduct.sku}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-h-[100px] sm:max-h-[160px] overflow-y-auto pr-1">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-3 sm:gap-4 items-baseline">
                      <span className="text-2xl sm:text-3xl font-black text-teal-850">৳{selectedProduct.price}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-xs sm:text-sm line-through text-gray-400">৳{selectedProduct.originalPrice}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            handleAddToCart(selectedProduct);
                            setSelectedProduct(null);
                          }}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <ShoppingCart className="w-4 h-4" /> কার্টে যোগ করুন
                        </button>

                        <a 
                          href={`https://wa.me/8801707019349?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি "${selectedProduct.banglaName || selectedProduct.name}" প্রোডাক্টটি কিনতে আগ্রহী। মূল্য: ৳${selectedProduct.price}।`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center flex items-center justify-center"
                          id={`modal-whatsapp-${selectedProduct.id}`}
                        >
                          <MessageCircle className="w-4 h-4" /> হোয়াটসঅ্যাপ
                        </a>
                      </div>

                      {/* Display the active directory folder link */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 space-y-1">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 block">প্রোডাক্ট ফোল্ডার পাথ (Direct URL):</span>
                        <div className="flex gap-1.5 items-center justify-between">
                          <code className="text-[10px] font-mono text-teal-600 overflow-hidden text-ellipsis whitespace-nowrap block max-w-[210px] sm:max-w-[320px]">
                            {`${window.location.origin}/#/category/${encodeURIComponent(selectedProduct.category)}/product/${encodeURIComponent(selectedProduct.id)}`}
                          </code>
                          <button 
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/#/category/${encodeURIComponent(selectedProduct.category)}/product/${encodeURIComponent(selectedProduct.id)}`;
                              navigator.clipboard.writeText(url).then(() => {
                                triggerSystemNotification("📋 প্রোডাক্টের ডিরেক্টরি ফোল্ডার লিংক কপি করা হয়েছে!");
                              }).catch(() => {
                                const textArea = document.createElement("textarea");
                                textArea.value = url;
                                document.body.appendChild(textArea);
                                textArea.select();
                                document.execCommand("copy");
                                document.body.removeChild(textArea);
                                triggerSystemNotification("📋 প্রোডাক্টের ডিরেক্টরি ফোল্ডার লিংক কপি করা হয়েছে!");
                              });
                            }}
                            className="bg-white hover:bg-gray-100 text-gray-500 p-1.5 rounded-lg border border-gray-200 cursor-pointer flex items-center justify-center shrink-0"
                            title="লিংক কপি করুন"
                          >
                            <Link className="w-3.5 h-3.5 text-teal-600" />
                          </button>
                        </div>
                      </div>
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
                    placeholder="উদা: বাদল হোসাইন" 
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'Cash on Delivery', logo: <div className="flex flex-col items-center justify-center gap-1.5"><Truck className="w-5 h-5 text-teal-600" /> <span className="text-[9px] font-bold text-gray-800 leading-tight">ক্যাশ অন ডেলিভারি (COD)</span></div> },
                      { id: 'bKash', logo: <div className="flex flex-col items-center justify-center gap-1"><BkashLogo /> <span className="text-[9px] font-extrabold text-pink-600 leading-tight">বিকাশ পেমেন্ট</span></div> },
                      { id: 'Nagad', logo: <div className="flex flex-col items-center justify-center gap-0.5"><NagadLogo /> <span className="text-[9px] font-extrabold text-orange-600 leading-tight">নগদ পেমেন্ট</span></div> },
                      { id: 'Rocket', logo: <div className="flex flex-col items-center justify-center gap-1"><RocketLogo /> <span className="text-[9px] font-extrabold text-purple-700 leading-tight">রকেট পেমেন্ট</span></div> }
                    ].map(method => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-2.5 rounded-2xl border text-center transition flex items-center justify-center cursor-pointer min-h-[72px] ${
                          paymentMethod === method.id 
                            ? 'bg-teal-50/80 border-teal-600 text-teal-900 shadow-sm ring-1 ring-teal-600' 
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {method.logo}
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
                  <p className="text-xs text-gray-500">Merchant: FeelZone Fashion Ltd</p>
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
                    <p className="text-[10px] text-gray-400">By clicking agree, you authorize FeelZone Fashion to simulate charging your purse during testing.</p>
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
                  <p className="text-sm border-zinc-300">FeelZone Fashion Retail Invoice</p>
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
                <h3 className="text-lg font-black text-gray-950">কাস্টমার অ্যাকাউন্ট রেজিস্ট্রেশন ও লগইন</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">সহজ ও দ্রুত কেনাকাটার জন্য নাম ও মোবাইল নাম্বার দিয়ে সাইন ইন করুন</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">আপনার নাম *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="আপনার সম্পূর্ণ নাম লিখুন" 
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <User className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">মোবাইল নাম্বার *</label>
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
                  <p className="text-[10px] text-gray-400 leading-relaxed">উদাহরণ: 01712345678</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition border border-gray-200"
                  >
                    বন্ধ করুন
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer"
                  >
                    লগইন ও রেজিস্টার
                  </button>
                </div>
              </form>

              {/* Optional Admin Switch Option inside the modal */}
              {onAdminViewClick && (
                <div className="pt-4 border-t border-gray-100 text-center">
                  <p className="text-[11px] text-gray-500">
                    আপনি কি স্টোর এডমিন?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        onAdminViewClick();
                      }}
                      className="text-teal-600 hover:text-teal-800 font-extrabold cursor-pointer hover:underline"
                    >
                      অ্যাডমিন প্যানেল লগইন করুন →
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Profile Modal Overlay */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-[24px] overflow-hidden shadow-2xl relative border border-gray-100 max-h-[90vh] flex flex-col md:flex-row"
              id="customer-profile-modal"
            >
              {/* Left Sidebar Menu */}
              <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-5 flex flex-col justify-between max-h-[35vh] md:max-h-none overflow-y-auto shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3.5 border-b border-gray-200">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-xs">
                      {userName ? userName.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-black text-gray-950 leading-tight truncate">{userName || 'সম্মানিত গ্রাহক'}</h4>
                      <p className="text-[10px] text-teal-605 font-semibold text-teal-600 font-mono tracking-tight">{userPhone}</p>
                    </div>
                  </div>

                  <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2.5 md:pb-0 gap-1.5 md:gap-1.5 whitespace-nowrap">
                    {[
                      { id: 'profile', display: '👤 My Profile', icon: User },
                      { id: 'orders', display: '🛒 My Orders', icon: ShoppingBag },
                      { id: 'wishlist', display: '❤️ Wishlist', icon: Heart },
                      { id: 'address', display: '📍 My Address', icon: MapPin },
                      { id: 'payments', display: '💳 Payment Methods', icon: CreditCard },
                      { id: 'coupons', display: '🎁 Coupons & Rewards', icon: Gift },
                      { id: 'notifications', display: '🔔 Notifications', icon: Bell },
                      { id: 'password', display: '🔒 Change Password', icon: Lock },
                      { id: 'support', display: '💬 Support', icon: MessageSquare },
                      { id: 'settings', display: '⚙️ Settings', icon: Settings },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = profileActiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setProfileActiveTab(tab.id as any)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer text-left ${
                            active 
                              ? 'bg-teal-605 bg-teal-600 text-white shadow-xs' 
                              : 'text-gray-600 hover:bg-gray-150 hover:text-gray-900 bg-transparent'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-500'}`} />
                          <span>{tab.display}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-3.5 border-t border-gray-200 mt-2 md:mt-0">
                  <button 
                    onClick={() => {
                      setIsLoggedIn(false);
                      setUserName('');
                      setUserPhone('');
                      localStorage.removeItem('cust_isLoggedIn');
                      localStorage.removeItem('cust_userName');
                      localStorage.removeItem('cust_userPhone');
                      setShowProfileModal(false);
                      triggerSystemNotification('👋 আপনি সফলভাবে লগআউট করেছেন।');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold text-red-650 hover:bg-red-50 bg-red-50/20 border border-red-105 border-red-100 transition cursor-pointer text-center text-red-650"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-550" />
                    <span>লগআউট করুন (Logout)</span>
                  </button>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[55vh] md:max-h-none h-auto md:h-full box-border bg-white min-h-[380px] relative">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Profile Tab */}
                {profileActiveTab === 'profile' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">👤 আমার প্রোফাইল (My Profile)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার ব্যক্তিগত অ্যাকাউন্ট প্রোফাইল সেটিংস ও তথ্য</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">সম্পূর্ণ নাম *</label>
                        <input 
                          type="text" 
                          value={userName} 
                          onChange={(e) => {
                            setUserName(e.target.value);
                            localStorage.setItem('cust_userName', e.target.value);
                          }} 
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">মোবাইল নাম্বার *</label>
                        <input 
                          type="tel" 
                          value={userPhone} 
                          disabled
                          className="w-full p-2.5 bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 rounded-xl cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">ইমেইল ঠিকানা</label>
                        <input 
                          type="email" 
                          placeholder="আপনার ইমেইল অ্যাড্রেস লিখুন" 
                          value={profileEmail} 
                          onChange={(e) => {
                            setProfileEmail(e.target.value);
                            localStorage.setItem('cust_profileEmail', e.target.value);
                          }} 
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">লিঙ্গ (Gender)</label>
                        <select 
                          value={profileGender} 
                          onChange={(e) => {
                            setProfileGender(e.target.value);
                            localStorage.setItem('cust_profileGender', e.target.value);
                          }} 
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        >
                          <option value="Male">পুরুষ (Male)</option>
                          <option value="Female">মহিলা (Female)</option>
                          <option value="Other">অন্যান্য (Other)</option>
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">জন্ম তারিখ (DOB)</label>
                        <input 
                          type="date" 
                          value={profileDob} 
                          onChange={(e) => {
                            setProfileDob(e.target.value);
                            localStorage.setItem('cust_profileDob', e.target.value);
                          }} 
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerSystemNotification('✅ আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!')}
                      className="w-full sm:w-fit px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                    >
                      তথ্য আপডেট করুন
                    </button>
                  </div>
                )}

                {/* Orders Tab */}
                {profileActiveTab === 'orders' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">🛒 আমার অর্ডারসমূহ (My Orders)</h3>
                      <p className="text-xs text-gray-400 font-semibold font-sans">আপনার মোবাইল নাম্বারে ট্র্যাকড অর্ডার লিস্ট</p>
                    </div>

                    <div className="space-y-3 pr-1 max-h-[380px] overflow-y-auto">
                      {orders.filter(ord => {
                        if (!userPhone) return false;
                        const normUser = userPhone.replace(/[^0-9]/g, '').slice(-11);
                        const normOrd = ord.phone.replace(/[^0-9]/g, '').slice(-11);
                        return normUser === normOrd;
                      }).length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 font-bold font-sans">এখনো কোনো অর্ডার করা হয়নি!</p>
                          <button 
                            onClick={() => setShowProfileModal(false)}
                            className="mt-3 text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-2 rounded-xl transition"
                          >
                            এখনই কেনাকাটা করুন
                          </button>
                        </div>
                      ) : (
                        orders.filter(ord => {
                          if (!userPhone) return false;
                          const normUser = userPhone.replace(/[^0-9]/g, '').slice(-11);
                          const normOrd = ord.phone.replace(/[^0-9]/g, '').slice(-11);
                          return normUser === normOrd;
                        }).map((ord) => {
                          const getStatusLabelText = (st: string) => {
                            switch (st) {
                              case 'Pending': return 'অপেক্ষমান';
                              case 'Confirmed': return 'অনুমোদিত';
                              case 'Shipped': return 'ডেলিভারিতে আছে';
                              case 'Delivered': return 'ডেলিভারি সম্পন্ন';
                              case 'Cancelled': return 'বাতিল হয়েছে';
                              default: return st;
                            }
                          };

                          const getStatusBadgeClass = (st: string) => {
                            switch (st) {
                              case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
                              case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
                              case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-200';
                              case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
                              case 'Cancelled': return 'bg-rose-50 text-rose-605 border-rose-200';
                              default: return 'bg-gray-50 text-gray-650 border-gray-200';
                            }
                          };

                          return (
                            <div key={ord.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-2.5 shadow-2xs">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-gray-750">অর্ডার #{ord.id.substring(0, 8)}</span>
                                <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold ${getStatusBadgeClass(ord.status)}`}>
                                  {getStatusLabelText(ord.status)}
                                </span>
                              </div>

                              <div className="text-[11px] text-gray-600 space-y-1.5 border-t border-b border-gray-200/60 py-2">
                                {ord.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 bg-teal-50 text-teal-600 flex items-center justify-center rounded-sm text-[10px] font-bold">x{item.quantity}</span>
                                      <span className="font-semibold truncate max-w-[180px] text-gray-800">{item.product.banglaName || item.product.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">৳{item.product.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-[10px] text-gray-450 font-bold">{new Date(ord.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="font-black text-teal-650 text-xs">মোট: <b className="font-mono text-sm text-teal-700">৳{ord.totalAmount}</b></span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Wishlist Tab */}
                {profileActiveTab === 'wishlist' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">❤️ উইশলিস্ট (Wishlist)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার পছন্দের পণ্যের তালিকা ও অফারসমূহ</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {products.filter(p => likedProducts[p.id]).length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 col-span-2">
                          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 font-bold">আপনার উইশলিস্ট খালি আছে!</p>
                          <button 
                            onClick={() => setShowProfileModal(false)}
                            className="mt-3 text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-2 rounded-xl transition"
                          >
                            স্টোর ব্রাউজ করুন
                          </button>
                        </div>
                      ) : (
                        products.filter(p => likedProducts[p.id]).map(p => (
                          <div key={p.id} className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex gap-3 items-center">
                            <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-905 truncate leading-tight">{p.banglaName || p.name}</h4>
                              <p className="text-xs font-black text-teal-600 font-mono">৳{p.price}</p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button 
                                onClick={() => {
                                  handleAddToCart(p);
                                  triggerSystemNotification('🛒 প্রোডাক্টটি কার্টে যোগ করা হয়েছে!');
                                }}
                                className="px-2 py-1 bg-teal-600 text-white text-[9px] font-black rounded-lg hover:bg-teal-700 cursor-pointer transition"
                              >
                                কার্ট
                              </button>
                              <button 
                                onClick={() => toggleLike(p.id)}
                                className="text-[9px] text-red-500 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                              >
                                বাদ দিন
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Address Tab */}
                {profileActiveTab === 'address' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">📍 আমার ঠিকানা (My Address)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার ডিফল্ট শিপিং ও ডেলিভারি ঠিকানা</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550 uppercase">সম্পূর্ণ ঠিকানা (বাসা, রোড ও এলাকা) *</label>
                        <textarea 
                          rows={3}
                          value={addressHome} 
                          onChange={(e) => {
                            setAddressHome(e.target.value);
                            localStorage.setItem('cust_addressHome', e.target.value);
                          }} 
                          placeholder="যেমন: ব্যাংক কলোনী, সাভার, ঢাকা।"
                          className="w-full p-2.5 bg-gray-50 text-gray-950 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-555">শহর/থানা *</label>
                          <input 
                            type="text" 
                            value={addressCity} 
                            onChange={(e) => {
                              setAddressCity(e.target.value);
                              localStorage.setItem('cust_addressCity', e.target.value);
                            }} 
                            placeholder="Savar"
                            className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-555">জেলা *</label>
                          <select 
                            value={addressDistrict} 
                            onChange={(e) => {
                              setAddressDistrict(e.target.value);
                              setCheckoutDistrict(e.target.value);
                              localStorage.setItem('cust_addressDistrict', e.target.value);
                            }} 
                            className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          >
                            {BANGLADESH_DISTRICTS.map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setCheckoutAddress(addressHome);
                          setCheckoutDistrict(addressDistrict);
                          triggerSystemNotification('✅ আপনার ডেলিভারি লাইভ ঠিকানা সিঙ্ক ও সেভ সম্পন্ন হয়েছে!');
                        }}
                        className="w-full sm:w-fit px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                      >
                        ঠিকানা সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                {profileActiveTab === 'payments' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">💳 পেমেন্ট পদ্ধতি (Payment Methods)</h3>
                      <p className="text-xs text-gray-400 font-semibold font-sans">সংরক্ষিত মোবাইল ওয়ালেট বা ডেবিট/ক্রেডিট কার্ড</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-pink-100 text-pink-700 rounded-xl font-black text-xs">BK</div>
                          <div>
                            <h4 className="text-xs font-black text-gray-905">বিকাশ ওয়ালেট সংযোগ</h4>
                            <p className="text-[10px] text-gray-500 font-mono">**** 19349 (ডিফল্ট)</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-teal-600 text-white font-extrabold px-2 py-1 rounded-md">ডিফল্ট</span>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 text-orange-700 rounded-xl font-bold text-xs">NG</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">নগদ ওয়ালেট অ্যাকাউন্ট</h4>
                            <p className="text-[10px] text-gray-500">লিংক করার বিকল্প রয়েছে</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => triggerSystemNotification('🔑 নগদ অটো-গেটওয়ে সংযোগ শীঘ্রই চালু হচ্ছে।')}
                          className="text-[10px] text-teal-600 font-black hover:underline"
                        >
                          লিংক করুন
                        </button>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">VS</div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">ভিসা / মাস্টারকার্ড</h4>
                            <p className="text-[10px] text-gray-500">VIP সংরক্ষিত মেম্বার কার্ড</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => triggerSystemNotification('🔒 এই কাস্টম গেটওয়ে সুবিধাটি সাময়িক বন্ধ আছে।')}
                          className="text-[10px] text-teal-600 font-bold hover:underline bg-transparent"
                        >
                          যুক্ত করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coupons and Rewards */}
                {profileActiveTab === 'coupons' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">🎁 কুপন ও রিওয়ার্ড (Coupons & Rewards)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার সঞ্চিত রিওয়ার্ড পয়েন্ট ও ডিসকাউন্ট অফার</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-teal-50/20 border-2 border-dashed border-teal-500/30 rounded-2xl text-center space-y-1">
                        <p className="text-[11px] font-extrabold text-teal-800">মোট রিওয়ার্ড পয়েন্ট</p>
                        <p className="text-3xl font-black text-teal-600">১২০ <span className="text-xs font-bold text-gray-500">PT</span></p>
                        <p className="text-[9px] text-gray-400">প্রতি অর্ডারে ১০ ক্যাশব্যাক সমতুল্য</p>
                      </div>

                      <div className="p-4 bg-pink-50/20 border-2 border-dashed border-pink-500/30 rounded-2xl text-center space-y-1">
                        <p className="text-[11px] font-extrabold text-pink-850">মেম্বারশিপ লেভেল</p>
                        <p className="text-lg font-black text-pink-650">সিলভার মেম্বার</p>
                        <p className="text-[9px] text-gray-400">পরের ধাপে যেতে ২০০ পয়েন্ট প্রয়োজন</p>
                      </div>

                      <div className="sm:col-span-2 p-3 bg-amber-50/55 border border-amber-205 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Gift className="w-5 h-5 text-amber-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-tight">WELCOME50</p>
                            <p className="text-[10px] text-gray-500">প্রথম অর্ডারে ফ্লাট ৫০ টাকা ডিসকাউন্ট বা ছাড় কুপন</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('WELCOME50');
                            triggerSystemNotification('📋 কুপন "WELCOME50" কপি করা হয়েছে!');
                          }}
                          className="text-[10px] bg-amber-600 text-white font-black px-3 py-1.5 rounded-lg hover:bg-amber-700 transition cursor-pointer"
                        >
                          কপি কোড
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {profileActiveTab === 'notifications' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">🔔 নোটিফিকেশন (Notifications)</h3>
                      <p className="text-xs text-gray-400 font-semibold font-sans">অর্ডার আপডেট ও অ্যাকাউন্ট আপডেট নোটিফিকেশন</p>
                    </div>

                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                      {[
                        { text: 'স্বাগতম! FeelZone Fashion এ আপনার অ্যাকাউন্ট রেজিস্ট্রেশন সম্পন্ন হয়েছে।', date: 'আজ, ০৮:৪৫ PM', unread: true },
                        { text: 'সাভারে ব্যাংক কলোনী সেন্টারে কাস্টম এক্সপ্রেস ক্যাশ অন ডেলিভারি সফলভাবে আপডেট হয়েছে।', date: '৫ জুন, ২০২৬', unread: false },
                        { text: 'আপনার অর্ডারের পণ্যটি দ্রুত ডেলিভারির উদ্দেশ্যে পাঠানো হয়েছে!', date: '১ জুন, ২০২৬', unread: false },
                      ].map((notif, idx) => (
                        <div key={idx} className={`p-3 border rounded-xl flex gap-2.5 text-xs leading-relaxed ${
                          notif.unread ? 'bg-teal-50/20 border-teal-150' : 'bg-gray-50/60 border-gray-150'
                        }`}>
                          {notif.unread && <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0 animate-pulse" />}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-850">{notif.text}</p>
                            <span className="text-[10px] text-gray-400 font-medium block mt-1">{notif.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Change Password / PIN */}
                {profileActiveTab === 'password' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">🔒 পাসওয়ার্ড বা সিকিউরিটি পিন (Password & PIN)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার অ্যাকাউন্ট নিরাপদ রাখতে ৪ ডিজিটের সেভ পিন সেট করুন</p>
                    </div>

                    <div className="space-y-3.5 max-w-sm">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550">বর্তমান ওটিপি / ৪ ডিজিটের পিন</label>
                        <input 
                          type="password" 
                          placeholder="উদা: 1234"
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-550">নতুন সিকিউর পিন সেট করুন</label>
                        <input 
                          type="password" 
                          placeholder="****"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 text-gray-900 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (newPin.length < 4) {
                            alert('দয়া করে ৪ ডিজিটের সঠিক পিন লিখুন');
                            return;
                          }
                          setCurrentPin('');
                          setNewPin('');
                          triggerSystemNotification('🔒 অভিনন্দন! আপনার অ্যাকাউন্ট সিকিউরিটি পিন আপডেট হয়েছে।');
                        }}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
                      >
                        সিকিউরিটি পিন সেট করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Support Tab */}
                {profileActiveTab === 'support' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">💬 কাস্টমার সাপোর্ট ও গাইডলাইন (Customer Support)</h3>
                      <p className="text-xs text-gray-400 font-semibold font-sans">যেকোনো মতামত ও সাপোর্টের জন্য যোগাযোগ করুন</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a 
                        href="tel:01707019349"
                        className="p-3 bg-teal-50/50 border border-teal-100/50 hover:bg-teal-50 rounded-xl flex items-center gap-3 transition cursor-pointer no-underline"
                      >
                        <Phone className="w-5 h-5 text-teal-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black text-gray-950 leading-tight">সরাসরি ২৪/৭ হেল্পলাইন</h4>
                          <p className="text-[10px] text-teal-750 font-black font-mono">০১৭০৭০১৯৩৪৯</p>
                        </div>
                      </a>

                      <a 
                        href="https://wa.me/8801707019349"
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="p-3 bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition cursor-pointer no-underline"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black text-gray-950 leading-tight">হোয়াটসঅ্যাপ মেসেঞ্জারে চ্যাট</h4>
                          <p className="text-[10px] text-emerald-700 font-bold">ইনস্ট্যান্ট দ্রুত রেসপন্স</p>
                        </div>
                      </a>

                      <div className="sm:col-span-2 p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                        <h4 className="text-xs font-black text-gray-905">তাৎক্ষণিক কাস্টমার টিকেট ই-পোর্টাল</h4>
                        <div className="space-y-2">
                          <input 
                            placeholder="টিকিটের বিষয় (যেমন: ডেলিভারি ট্র্যাকিং সাহায্য)" 
                            className="w-full p-2.5 bg-white text-gray-950 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none" 
                          />
                          <textarea 
                            placeholder="পণ্য সম্পর্কে বিস্তারিত লিখুন..." 
                            rows={2} 
                            className="w-full p-2.5 bg-white text-gray-955 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none" 
                          />
                          <button 
                            onClick={() => triggerSystemNotification('📩 আপনার সাপোর্ট টিকিট "STK-2026" খোলা হয়েছে!')}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                          >
                            টিকেট সাবমিট করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {profileActiveTab === 'settings' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-900">⚙️ সেটিংস ও নোটিফিকেশন পলিসি (Settings)</h3>
                      <p className="text-xs text-gray-400 font-semibold">আপনার অ্যাকাউন্ট সম্পর্কিত সিস্টেম সেটিংস</p>
                    </div>

                    <div className="space-y-2.5 text-xs font-bold text-gray-700">
                      <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-155 rounded-xl cursor-pointer">
                        <input type="checkbox" defaultChecked className="text-teal-650 focus:ring-teal-500 rounded" />
                        <span>অর্ডারের সর্বশেষ আপডেট মোবাইল এসএমএস এর মাধ্যমে পাঠান</span>
                      </label>
                      <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-155 rounded-xl cursor-pointer">
                        <input type="checkbox" defaultChecked className="text-teal-650 focus:ring-teal-500 rounded" />
                        <span>নতুন ডিসকাউন্ট কুপন ও গিফট ভাউচার অফার ইমেইলে ইত্তেফাক পাঠান</span>
                      </label>
                      <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-155 rounded-xl cursor-pointer">
                        <input type="checkbox" defaultChecked className="text-teal-650 focus:ring-teal-500 rounded" />
                        <span>আপনার কার্টের পণ্য ট্র্যাকিং রিমাইন্ডার প্রদর্শন দিন</span>
                      </label>
                    </div>
                    <button 
                      onClick={() => triggerSystemNotification('⚙️ অভিনন্দন! আপনার সেটিংস সফলভাবে আপডেট ও সেভ হয়েছে।')}
                      className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-extrabold transition hover:bg-teal-700 cursor-pointer"
                    >
                      সেটিংস আপডেট করুন
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
