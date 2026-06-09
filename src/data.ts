import { Product, Order, Employee, LandingPage } from './types';

export const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Cox\'s Bazar', 'Bogra', 'Jessore', 'Feni', 'Tangail'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Customized Laser Carved Wooden Photo Frame',
    banglaName: 'কাস্টমাইজড লেজার খোদাইকৃত কাঠের টেবিল ফ্রেম',
    price: 490,
    originalPrice: 700,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    category: 'কাস্টমাইজড ফটো ফ্রেম',
    stock: 45,
    sku: 'FRM-WD-LASER',
    description: 'আপনার নিজের ছবি বা বিশেষ কোনো বার্তা সম্পূর্ণ কাঠের উপরিভাগে নিখুঁত লেজার প্রযুক্তির মাধ্যমে নিখুঁতভাবে খোদাই করে তৈরি চমৎকার টেবিল বা ডেস্ক ফ্রেম।',
    ratings: 4.9,
    reviewsCount: 128
  },
  {
    id: 'prod-2',
    name: 'Luxury Family Memorial Collage Wall Frame (8-in-1)',
    banglaName: 'লাক্সারি ফ্যামিলি কোলাজ ওয়াল ফ্রেম ৮-ইন-১',
    price: 1450,
    originalPrice: 1950,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    category: 'ওয়াল মেট ও কোলাজ ফ্রেম',
    stock: 28,
    sku: 'FRM-CLLG-LUX',
    description: 'পরিবারের সেরা আটটি স্মৃতিময় মুহূর্ত এক চমৎকার ফ্রেমে সাজানোর জন্য মেমোরিয়াল কোলাজ ওয়াল ডেকোর আর্ট গ্যালারি ফ্রেম। প্রকোষ্ঠ সাইজ স্ট্যান্ডার্ড ৪x৬ ইঞ্চি।',
    ratings: 4.8,
    reviewsCount: 94
  },
  {
    id: 'prod-3',
    name: '3D Acrylic Glowing LED Wish Night Frame',
    banglaName: 'থ্রিডি এক্রিলিক গ্লোয়িং এলইডি উইশ ফ্রেম',
    price: 790,
    originalPrice: 1100,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400',
    category: '৩ডি ও এলইডি ফ্রেম',
    stock: 22,
    sku: 'FRM-3D-LED',
    description: 'রাতের মোলায়েম হালকা আলোয় আপনার প্রিয় ছবি বা ভালোবাসার বার্তা জ্বলজ্বল করবে এই কাস্টমাইজড এক্রিলিক থ্রিডি ট্রানস্প্যারেন্ট জাদুকরী ফ্রেমটিতে।',
    ratings: 4.7,
    reviewsCount: 215
  },
  {
    id: 'prod-4',
    name: 'Customized Spotify Music Wooden Table Frame',
    banglaName: 'প্রিমিয়াম উডেন স্পটিফাই মিউজিক ফ্রেম',
    price: 450,
    originalPrice: 650,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    category: 'কাঠের খোদাইকৃত গিফট',
    stock: 35,
    sku: 'FRM-WD-SPOTIFY',
    description: 'প্রিয় মানুষের প্রিয় গানটির কাস্টম স্ক্যানযোগ্য স্পটিফাই কোড এবং আপনার স্পেশাল কাপল ছবি সম্বলিত কাঠের তৈরি আকর্ষণীয় ডেস্ক স্ট্যান্ড মেমোরি প্লেট।',
    ratings: 4.9,
    reviewsCount: 110
  },
  {
    id: 'prod-5',
    name: 'Romantic Magic Mirror Dual-Use Light Frame',
    banglaName: 'রোমান্টিক ম্যাজিক মিরর লাইটিং ফটো ফ্রেম',
    price: 890,
    originalPrice: 1250,
    image: 'https://images.unsplash.com/photo-1603006905393-0d5bfa704175?auto=format&fit=crop&q=80&w=400',
    category: '৩ডি ও এলইডি ফ্রেম',
    stock: 15,
    sku: 'FRM-MAG-MIRROR',
    description: 'এটি সুইচ অন করলেই পেছনের ব্যাকলাইটে আপনার কাস্টম ছবি শো করবে এবং সুইচ অফ রাখলে এটি একটি নিখুঁত ড্রেসিং টেবিল আয়নার রূপ ধারণ করবে।',
    ratings: 4.8,
    reviewsCount: 88
  },
  {
    id: 'prod-6',
    name: 'Vintage Antique Brass Hinge Double Frame',
    banglaName: 'ভিন্টেজ ব্রাস অ্যান্টিক ডাবল মেমোরি ফ্রেম',
    price: 650,
    originalPrice: 900,
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400',
    category: 'টেবিল ও মেমোরি ফ্রেম',
    stock: 19,
    sku: 'FRM-BRS-VTG',
    description: 'আভিজাত্য ও ঐতিহ্যের দারুণ মেলবন্ধন! অ্যান্টিক ব্রাস আবরণে প্রিমিয়াম গ্লাস কোটিং দিয়ে তৈরি চমৎকার ডাবল ফোল্ডিং ডেকোরেটিভ টেবিল ফ্রেম।',
    ratings: 4.6,
    reviewsCount: 42
  },
  {
    id: 'prod-7',
    name: 'Heartfelt Couple Personalized Shadow Box Frame',
    banglaName: 'কাস্টম কাপল মেমোরি শ্যাডো মেটাল বক্স ফ্রেম',
    price: 1250,
    originalPrice: 1700,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400',
    category: 'স্পেশাল কাপল গিফটস',
    stock: 14,
    sku: 'FRM-CPL-SHADOW',
    description: 'রোমান্টিক থ্রিডি শ্যাডো কাঠের মেমোরিয়াল ফ্রেমের ভেতরে ভালোবাসা উপচে পড়া চমৎকার ছবির বিন্যাস ও রাজকীয় কাস্টম নামের প্রিমিয়াম লাইটিং সজ্জা।',
    ratings: 4.9,
    reviewsCount: 75
  },
  {
    id: 'prod-8',
    name: 'Minimalist Black Gallery Collage Frame (Set of 3)',
    banglaName: 'মিনিমালিস্ট ব্ল্যাক গ্যালারি কোলাজ ফ্রেম ৩-টি সেট',
    price: 950,
    originalPrice: 1350,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    category: 'ওয়াল মেট ও কোলাজ ফ্রেম',
    stock: 50,
    sku: 'FRM-SET-3BLK',
    description: 'শোবার ঘর বা ড্রয়িং রুমের দেয়ালকে আধুনিক ও নান্দনিক করতে তিনটি অসাধারণ ছবির মিনিমালিস্ট বর্ডার কোলাজ ফ্রেম ডিজাইনার ডেকোর সেট।',
    ratings: 4.8,
    reviewsCount: 130
  },
  {
    id: 'prod-9',
    name: 'Royal Diamond Beveled Crystal Desk Frame',
    banglaName: 'রাজকীয় ক্রিস্টাল কাট কাঁচের ডেস্ক ফ্রেম',
    price: 590,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    category: 'টেবিল ও মেমোরি ফ্রেম',
    stock: 30,
    sku: 'FRM-CRY-DIAMOND',
    description: 'দৃষ্টিনন্দন ভারী কাস্টম পলিশড ক্রিস্টাল কাট বেভেলড গ্লাসের তৈরি অসাধারণ টেবিলটপ স্মারক কালার ফ্রেম। কোনো কাঠের ফ্রেমিং ছাড়া অত্যন্ত ক্লাসি লুক।',
    ratings: 4.7,
    reviewsCount: 64
  },
  {
    id: 'prod-10',
    name: 'Handcrafted Multi-Layer 3D Portrait Wood Carving',
    banglaName: 'মাল্টি-লেয়ার থ্রিডি কাস্টম পোর্ট্রেট খোদাই ফ্রেম',
    price: 1850,
    originalPrice: 2500,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
    category: 'কাস্টমাইজড ফটো ফ্রেম',
    stock: 10,
    sku: 'FRM-3D-WOODCARVE',
    description: 'পাঁচটি ভিন্ন ডেপথ লেয়ারে সম্পূর্ণ কাঠের তৈরি লেজার ত্রিমাত্রিক রিয়েল কাস্টম পোর্ট্রেট ফ্রেম, যা ছবির প্রতিটি এক্সপ্রেশনকে জীবন্ত স্তরে বিভক্ত করে ফুটিয়ে তোলে।',
    ratings: 5.0,
    reviewsCount: 45
  },
  {
    id: 'prod-11',
    name: 'Sweet Memory LED Wooden Hanging String Board',
    banglaName: 'ঝুলন্ত ছবির উডেন স্ট্রিং ও এলইডি ক্লিপ বোর্ড',
    price: 550,
    originalPrice: 800,
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=400',
    category: 'স্পেশাল কাপল গিফটস',
    stock: 40,
    sku: 'GFT-LED-STRING',
    description: 'নান্দনিক পাটের রশি, ভিন্টেজ কাঠের বোর্ড, রঙিন স্ট্রিং এলইডি টুনি লাইট এবং ২০টি উডেন ক্লিপ দিয়ে সুন্দর করে ছবি ঝুলিয়ে রাখার এক চমৎকার স্মারক ওয়াল ডেকোরেটর।',
    ratings: 4.8,
    reviewsCount: 112
  },
  {
    id: 'prod-12',
    name: 'Double-Sided 360-Degree Rotating Tabletop Frame',
    banglaName: '৩৬০ ডিগ্রী ঘূর্ণায়মান ডুয়াল-সাইড টেবিল ফ্রেম',
    price: 690,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=400',
    category: 'টেবিল ও মেমোরি ফ্রেম',
    stock: 25,
    sku: 'FRM-ROT-360',
    description: 'একটি ফ্রেমেই দুই দিকে দুটি ছবি সেট করার অনন্য সুবিধা। কাঠামোর অভ্যন্তরে ফ্রেমটি ৩৬০ ডিগ্রী ঘুরানো যায় যা পড়ার বা লিভিং রুমের সৌন্দর্য দ্বিগুণ করে।',
    ratings: 4.7,
    reviewsCount: 53
  },
  {
    id: 'prod-13',
    name: 'Laser Carved Wooden Anniversary Card with Plaque',
    banglaName: 'লেজার খোদাইকৃত কাঠের শুভেচ্ছা কার্ড ও ফ্রেম সেট',
    price: 380,
    originalPrice: 550,
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    category: 'কাঠের খোদাইকৃত গিফট',
    stock: 60,
    sku: 'GFT-WD-CARD',
    description: 'জন্মদিনের শুভেচ্ছা বা যেকোনো প্রিয় বার্তা দৃষ্টিনন্দন লেজার প্রযুক্তির মাধ্যমে নিখুঁতভাবে খোদাইকৃত কাঠের ফোল্ডিং পোর্টেবল উইশিং কার্ড ও স্ট্যান্ড সেট।',
    ratings: 4.9,
    reviewsCount: 97
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
    totalAmount: 1940,
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
    totalAmount: 1580,
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
    totalAmount: 1340,
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
    totalAmount: 2900,
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
    title: 'Wooden Photo Frame Special',
    headline: 'কাস্টমাইজড লেজার খোদাইকৃত কাঠের আকর্ষণীয় টেবিল ফ্রেম',
    subheadline: 'প্রিয়জনের জন্মদিন বা যেকোনো স্মরণীয় দিনকে চিরস্থায়ী করে রাখুন কাঠ খোদাই করা এই ফ্রেম দিয়ে। আপনার ছবি বা বার্তা নিখুঁত ফিনিশিং সহ প্রিন্ট করে পৌঁছে দেব দ্রুততম সময়ে।',
    badgeText: 'বেস্ট সেলিং অফার - ৩০% স্পেশাল ডিসকাউন্ট!',
    guaranteeText: '১০০% অরিজিনাল বার্মিজ সেগুন কাঠ এবং টেকসই ফ্রেমিং পলিশিং নিশ্চয়তা!',
    accentColor: '#f59e0b'
  },
  {
    id: 'land-2',
    productId: 'prod-2',
    theme: 'Deep Emerald',
    title: 'Luxury Family Collage Frame',
    headline: 'লাক্সারি ফ্যামিলি কোলাজ ওয়াল ফ্রেম ৮-ইন-১ সজ্জা',
    subheadline: 'একই ফ্রেমে সাজান পরিবারের প্রিয় ৮টি স্মরণীয় স্মৃতিপট। প্রিমিয়াম ডেকোরেটিভ কোটিং দিয়ে তৈরি চমৎকার কোলাজ গ্যালারি আপনার দেয়ালের আভিজাত্য বাড়াবে কয়েকগুণ।',
    badgeText: 'ট্রেন্ডিং হোম ডেকোর আইটেম',
    guaranteeText: 'সহজে ঝুলানোর ডাবল উইং হুক সজ্জা এবং ঝকঝকে অ্যান্টিক গ্লাস কোটিং সহ!',
    accentColor: '#10b981'
  },
  {
    id: 'land-3',
    productId: 'prod-3',
    theme: 'Cosmic Blue',
    title: '3D LED Acrylic Custom Frame',
    headline: 'থ্রিডি এক্রিলিক গ্লোয়িং এলইডি উইশ নাইট ফ্রেম',
    subheadline: 'আপনার শোবার ঘরের জন্য দারুণ আলো আঁধারির খেলা! জাদুকরী গ্লাস প্লেটের উপর লেজার কাটিং করে ফুটিয়ে তোলা হয়েছে থ্রিডি অবয়ব যা রাতের মৃদু উষ্ণ আলোয় ফুটিয়ে তুলবে প্রিয়জনকে।',
    badgeText: 'স্পেশাল প্রিমিয়াম লাইটিং এডিশন',
    guaranteeText: '১ বছরের ওয়ারেন্টি যুক্ত ইউএসবি এডাপ্টার ও এলইডি ড্রাইভার স্ট্রিপ!',
    accentColor: '#3b82f6'
  },
  {
    id: 'land-4',
    productId: 'prod-4',
    theme: 'Sleek Charcoal',
    title: 'Spotify Custom Music Frame',
    headline: 'প্রিমিয়াম উডেন স্পটিফাই মিউজিক ও কাস্টম পিকচার ফ্রেম',
    subheadline: 'গান ও ভালোবাসাই জীবন! ছবিটির একদম ওপরে আপনার প্রিয় গানটির স্ক্যানযোগ্য স্পটিফাই মিউজিক কোড দিয়ে সাজানো যা ফোন ক্যামেরা স্ক্যান করলেই বেজে উঠবে তাৎক্ষণিক।',
    badgeText: 'নান্দনিক আর্ট প্লেট ডিজাইন',
    guaranteeText: 'পানি নিরোধক কোটিং পলিশিং এবং মজবুত ওড বেজ টেবিল হোল্ডার!',
    accentColor: '#4b5563'
  },
  {
    id: 'land-5',
    productId: 'prod-5',
    theme: 'Bold Red',
    title: 'Magic Mirror LED Photo Frame',
    headline: 'রোমান্টিক ম্যাজিক মিরর দ্বিমুখী লাইটিং ফটো ফ্রেম',
    subheadline: 'এক অঙ্গে দুই রূপ! লাইট বন্ধ থাকলে ঝকঝকে রাজকীয় ড্রেসিং আয়না, আর লাইট জ্বালালেই ভেসে উঠবে আপনার সবচেয়ে প্রিয় স্মৃতিময় সুন্দর মুহূর্ত। উপহার হিসেবে দারুণ অভিনব এটি!',
    badgeText: 'ফ্রি হোম ডেলিভারি!',
    guaranteeText: 'ক্যাটারিং বাবল ব্যাকড থ্রি-লেয়ার সুরক্ষা সহ অর্ডার করার সুবর্ণ সুযোগ।',
    accentColor: '#ef4444'
  }
];
