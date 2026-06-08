import { Product, Order, Employee, LandingPage } from './types';

export const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Cox\'s Bazar', 'Bogra', 'Jessore', 'Feni', 'Tangail'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Organic Sundarban Honey',
    banglaName: 'খাঁটি সুন্দরবনের মধু (১ কেজি)',
    price: 1250,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    category: 'খাদ্য সামগ্রী',
    stock: 45,
    sku: 'HON-SUN-1KG',
    description: 'সুন্দরবনের খলিসা ফুলের প্রাকৃতিক ও শতভাগ খাঁটি মধু। রোগ প্রতিরোধ ক্ষমতা বাড়াতে ও সুস্থ থাকতে প্রতিদিন মধুর জুড়ি নেই।',
    ratings: 4.9,
    reviewsCount: 128
  },
  {
    id: 'prod-2',
    name: 'Premium Pure Cow Ghee',
    banglaName: 'ঘি - খাঁটি গাভীর দুধের ঘি (৫০০ গ্রাম)',
    price: 950,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1589733901241-5e53429e145e?auto=format&fit=crop&q=80&w=400',
    category: 'খাদ্য সামগ্রী',
    stock: 28,
    sku: 'GHEE-COW-500',
    description: 'সিরাজের খাঁটি দুধের মাখন থেকে তৈরি সুগন্ধি এবং দানাদার গাভীর ঘি। পোলাও, বিরিয়ানি কিংবা গরম ভাতে অতুলনীয় স্বাদ।',
    ratings: 4.8,
    reviewsCount: 94
  },
  {
    id: 'prod-3',
    name: 'Smart Watch Series 8 Pro',
    banglaName: 'স্মার্ট ওয়াচ সিরিজ ৮ প্রো',
    price: 3450,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=400',
    category: 'ইলেকট্রনিক্স',
    stock: 12,
    sku: 'SW-8PRO-BLK',
    description: 'রক্তের অক্সিজেন পরিমাপক, হৃদকম্পন ট্র্যাকার ও কলিং সুবিধা সম্পন্ন লেটেস্ট স্মার্ট ওয়াচ। ফুল টাচ স্ক্রিন ডিসপ্লে এবং দীর্ঘস্থায়ী ব্যাটারি লাইফ।',
    ratings: 4.7,
    reviewsCount: 215
  },
  {
    id: 'prod-4',
    name: 'Premium Export Cotton Punjabee',
    banglaName: 'প্রিমিয়াম কটন পাঞ্জাবী',
    price: 1950,
    originalPrice: 2400,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400',
    category: 'পোশাক-পরিচ্ছদ',
    stock: 19,
    sku: 'PUNJ-COT-L',
    description: '১০০% এক্সপোর্ট কোয়ালিটি সুতি কাপড় দিয়ে তৈরি আকর্ষণীয় ডিজাইনের পাঞ্জাবী। ক্যাজুয়াল পরার জন্য আরামদায়ক ও ট্রেন্ডি।',
    ratings: 4.6,
    reviewsCount: 81
  },
  {
    id: 'prod-5',
    name: 'Premium Leather Wallet for Men',
    banglaName: 'চামড়ার এক্সক্লুসিভ মানিব্যাগ',
    price: 850,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1627124793633-8a690ec360af?auto=format&fit=crop&q=80&w=400',
    category: 'ফ্যাশন এক্সেসরিজ',
    stock: 60,
    sku: 'WAL-LEA-BRN',
    description: 'খাঁটি চামড়া (Pure Cow Leather) দিয়ে তৈরি চমৎকার ডিজাইনের মানিব্যাগ। পর্যাপ্ত কার্ড স্লট এবং কয়েন পকেট সহ দীর্ঘস্থায়ী ও টেকসই।',
    ratings: 4.9,
    reviewsCount: 142
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'আব্দুর রহমান',
    phone: '01712345678',
    address: 'বাড়ি নং ১২, রোড ৩, ধানমন্ডি',
    district: 'Dhaka',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[1], quantity: 1 }
    ],
    totalAmount: 2200,
    paymentMethod: 'bKash',
    paymentStatus: 'Paid',
    status: 'Delivered',
    createdAt: '2026-06-05T10:30:00Z',
    courierName: 'Steadfast',
    courierId: 'SF-948271',
    trackingNumber: 'TRK-SF-1011',
    fraudRiskScore: 5,
    fraudReasons: []
  },
  {
    id: 'ORD-1002',
    customerName: 'কামরুল হাসান',
    phone: '01899123456',
    address: 'অজানা বস্তি, নোয়াখালী',
    district: 'Dhaka',
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 2 }
    ],
    totalAmount: 6900,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Unpaid',
    status: 'Pending',
    createdAt: '2026-06-07T08:15:00Z',
    fraudRiskScore: 85,
    fraudReasons: [
      'ফোন নাম্বারে ৩ বার কল করা সত্ত্বেও রিসিভ হয়নি',
      'প্রদত্ত ঠিকানাটি সন্দেহজনক বা অস্পষ্ট',
      'একই আইপি থেকে পূর্বে ২টি অর্ডার ক্যানসেল করা হয়েছে'
    ]
  },
  {
    id: 'ORD-1003',
    customerName: 'নুসরাত জাহান',
    phone: '01911998877',
    address: '১৬/বি, ও আর নিজাম রোড',
    district: 'Chittagong',
    items: [
      { product: INITIAL_PRODUCTS[3], quantity: 1 },
      { product: INITIAL_PRODUCTS[4], quantity: 1 }
    ],
    totalAmount: 2800,
    paymentMethod: 'Nagad',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-06-06T14:22:00Z',
    fraudRiskScore: 12,
    fraudReasons: []
  },
  {
    id: 'ORD-1004',
    customerName: 'মিরাজুল ইসলাম',
    phone: '01555554444',
    address: 'মতিহার থানা মোড়, রাজশাহী',
    district: 'Rajshahi',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 2 }
    ],
    totalAmount: 1900,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Unpaid',
    status: 'Shipped',
    createdAt: '2026-06-06T09:00:00Z',
    courierName: 'Pathao',
    courierId: 'PTH-837419',
    trackingNumber: 'TRK-PTH-4022',
    fraudRiskScore: 25,
    fraudReasons: ['পূর্বে ১টি ডেলিভারি বিলম্ব হওয়ার নজির আছে']
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-01',
    name: 'মোঃ আজহারুল ইসলাম',
    role: 'স্টোর ম্যানেজার',
    email: 'azhar@feelzonefashion.com',
    phone: '01711223344',
    salary: 28000,
    attendanceRate: 96.5,
    joiningDate: '2024-01-10',
    status: 'Active'
  },
  {
    id: 'EMP-02',
    name: 'ফারজানা ইয়াসমিন',
    role: 'কাস্টমার সাপোর্ট এক্সিকিউটিভ',
    email: 'farjana@feelzonefashion.com',
    phone: '01833445566',
    salary: 16000,
    attendanceRate: 92.0,
    joiningDate: '2024-05-15',
    status: 'Active'
  },
  {
    id: 'EMP-03',
    name: 'সাকিব আল হাসান',
    role: 'ডেলিভারি ও প্যাকিং অ্যাসিস্ট্যান্ট',
    email: 'sakib@feelzonefashion.com',
    phone: '01911223355',
    salary: 15000,
    attendanceRate: 88.5,
    joiningDate: '2025-02-01',
    status: 'Active'
  }
];

export const INITIAL_LANDING_PAGES: LandingPage[] = [
  {
    id: 'land-1',
    productId: 'prod-1',
    theme: 'Warm Amber',
    title: 'Sundarban Honey Landing Page',
    headline: '১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের খলিসা ফুলের মধু',
    subheadline: 'সরাসরি সুন্দরবনের অভিজ্ঞ মৌয়ালদের সংগৃহীত খাঁটি মধু, যা দেবে আপনার পরিবারের দীর্ঘস্থায়ী স্বাস্থ্য সুরক্ষা।',
    badgeText: 'বেস্ট সেলিং অফার - ২৫% ছাড়!',
    guaranteeText: 'প্রমাণিত ভেজাল পেলে ১০ গুণ মূল্য ফেরত গ্যারান্টি!',
    accentColor: '#f59e0b'
  },
  {
    id: 'land-2',
    productId: 'prod-2',
    theme: 'Deep Emerald',
    title: 'Pure Ghee Landing Page',
    headline: 'সুগন্ধি এবং দানাদার প্রিমিয়াম গাভীর খাঁটি ঘি',
    subheadline: 'ঐতিহ্যবাহী উপায়ে প্রস্তুতকৃত খাঁটি গাভীর দুধের ঘি, প্রতিটি চামচে পাবেন চমৎকার সুঘ্রাণ এবং খাঁটি স্বাদ।',
    badgeText: '১০০% অরগানিক ঘি',
    guaranteeText: 'পুরো বাংলাদেশে ক্যাশ অন ডেলিভারি এবং মান সন্তুষ্টির গ্যারান্টি।',
    accentColor: '#10b981'
  },
  {
    id: 'land-3',
    productId: 'prod-3',
    theme: 'Cosmic Blue',
    title: 'Smart Watch Landing Page',
    headline: 'স্মার্ট লাইফস্টাইলের জন্য সিরিজ ৮ প্রো স্মার্ট ওয়াচ',
    subheadline: 'ব্লুটুথ কলিং, ফিটনেস ট্র্যাকিং, হার্ট রেট ও স্লিপ মনিটরিং সমৃদ্ধ আধুনিক গ্যাজেট।',
    badgeText: 'সীমিত সময়ের স্পেশাল ডিসকাউন্ট',
    guaranteeText: '১ বছরের অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি পলিসি!',
    accentColor: '#3b82f6'
  },
  {
    id: 'land-4',
    productId: 'prod-4',
    theme: 'Sleek Charcoal',
    title: 'Premium Punjabee Landing Page',
    headline: 'ঈদ ও উৎসবের আভিজাত্যে প্রিমিয়াম ডিজাইনার পাঞ্জাবী',
    subheadline: 'উচ্চমানের কটন কাপড়ের নিখুঁত কারুকাজ ও আধুনিক ডিজাইনের মেলবন্ধন। উৎসবের আমেজ বাড়াতে আজই অর্ডার করুন।',
    badgeText: 'সম্পূর্ণ নতুন কালেকশন',
    guaranteeText: 'সাইজে সমস্যা হলে ৭ দিনের মধ্যে পরিবর্তন করার সুযোগ।',
    accentColor: '#4b5563'
  },
  {
    id: 'land-5',
    productId: 'prod-5',
    theme: 'Bold Red',
    title: 'Leather Wallet Landing Page',
    headline: '১০০% খাঁটি চামড়ার এক্সক্লুসিভ স্টাইলিশ মানিব্যাগ',
    subheadline: 'দীর্ঘস্থায়ী ও সম্পূর্ণ প্রিমিয়াম লেদার দিয়ে প্রস্তুতকৃত যা আপনার ব্যক্তিত্ব ফুটিয়ে তুলবে দারুণভাবে।',
    badgeText: 'ফ্রি হোম ডেলিভারি!',
    guaranteeText: 'পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার সুবর্ণ সুযোগ।',
    accentColor: '#ef4444'
  }
];
