import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Building2, Users, UsersRound, Settings, BarChart3, Receipt, ShoppingBag, Truck,
  Smartphone, ShieldAlert, Key, Mail, Lock, Plus, Check, Play, UserCog, X,
  DollarSign, FileSpreadsheet, Search, RefreshCw, Eye, Sparkles, Printer, HeartHandshake, PhoneCall,
  Grid3X3, FolderEdit, Trash2, Tag, TrendingUp, User, ShoppingCart, Activity, FileText, Package,
  AlertTriangle
} from 'lucide-react';
import { Product, Order, Employee, SMSLog, LandingPage, UserRole, LandingPageTheme, OrderStatus, Category } from '../types';
import { BANGLADESH_DISTRICTS } from '../data';
import ProductAddModal from './Product/ProductAddModal';
import ProductEditModal from './Product/ProductEditModal';
import ProductList from './Product/ProductList';
import EditCategoryModal from './Category/EditCategoryModal';
import DeleteCategoryModal from './Category/DeleteCategoryModal';
import AddCategoryModal from './Category/AddCategoryModal';
import CourierSettingsPanel from './Courier/CourierSettingsPanel';
import LandingPageManager from './LandingPage/LandingPageManager';
import AdminBannerPanel from './Banner/AdminBannerPanel';
import AdminSEOPanel from './SEO/AdminSEOPanel';

// Custom Tooltip for Recharts Weekly Sales Bar Chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs font-sans space-y-1">
        <p className="font-extrabold text-teal-400">{data.label}</p>
        <p className="text-zinc-400 font-mono text-[10px]">{data.dateLabel}, 2026</p>
        <div className="border-t border-slate-800/80 my-1.5 pt-1.5 space-y-1">
          <p className="flex justify-between gap-5 font-bold">
            <span className="text-zinc-400">মোট বিক্রয়:</span>
            <span className="text-emerald-400">৳{data.revenue.toLocaleString()}</span>
          </p>
          <p className="flex justify-between gap-5 font-bold">
            <span className="text-zinc-400">অর্ডার সংখ্যা:</span>
            <span className="text-indigo-300">{data.ordersCount} টি</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  smsLogs: SMSLog[];
  setSmsLogs: React.Dispatch<React.SetStateAction<SMSLog[]>>;
  landingPages: LandingPage[];
  setLandingPages: React.Dispatch<React.SetStateAction<LandingPage[]>>;
  triggerSystemNotification: (message: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  setActiveLandingId: (id: string | null) => void;
  emptyCategories: Category[];
  setEmptyCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onLogout: () => void;
}

export default function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  employees,
  setEmployees,
  smsLogs,
  setSmsLogs,
  landingPages,
  setLandingPages,
  triggerSystemNotification,
  activeRole,
  setActiveRole,
  setActiveLandingId,
  emptyCategories,
  setEmptyCategories,
  onLogout
}: AdminPanelProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'pos' | 'orders' | 'courier' | 'categories' | 'hrm' | 'landing' | 'roles' | 'settings'>('analytics');
  const [courierSubTab, setCourierSubTab] = useState<'dispatches' | 'settings'>('dispatches');
  
  // Create / Edit states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminDeleteConfirmId, setAdminDeleteConfirmId] = useState<string | null>(null);
  const [adminLowStockThreshold, setAdminLowStockThreshold] = useState<number>(15);

  // Category Edit / Delete states
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);

  // POS State
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [posDiscount, setPosDiscount] = useState(0); // Flat Taka
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posCustomerAddress, setPosCustomerAddress] = useState('');
  const [posCustomerDistrict, setPosCustomerDistrict] = useState('Dhaka');
  const [posPaymentType, setPosPaymentType] = useState<'Cash' | 'bKash' | 'Nagad'>('Cash');
  const [searchPosQuery, setSearchPosQuery] = useState('');
  const [showThermalReceipt, setShowThermalReceipt] = useState<Order | null>(null);

  // SMS Generator State
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsTemplate, setSmsTemplate] = useState('Order Confirmation');
  const [smsCustomMessage, setSmsCustomMessage] = useState('');

  // Landing Page Edit States
  const [selectedLp, setSelectedLp] = useState<LandingPage | null>(landingPages[0] || null);

  // Tracking Integrations Configuration State
  const [fbPixelId, setFbPixelId] = useState('FB-PIX-204918482');
  const [gtmId, setGtmId] = useState('GTM-TS7X1K2');
  const [isSavedTracking, setIsSavedTracking] = useState(false);

  // HRM states
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('ডেলিভারি অ্যাসিস্ট্যান্ট');
  const [newEmpSalary, setNewEmpSalary] = useState(15000);
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [salaryCalculatorEmployee, setSalaryCalculatorEmployee] = useState<Employee | null>(null);

  const handleLpUpdate = (theme: LandingPageTheme, headline: string, subheadline: string, guaranteeText: string) => {
    if (!selectedLp) return;
    const updated = { ...selectedLp, theme, headline, subheadline, guaranteeText };
    setLandingPages(prev => prev.map(lp => lp.id === selectedLp.id ? updated : lp));
    setSelectedLp(updated);
  };

  const handleSaveTracking = () => {
    setIsSavedTracking(true);
    triggerSystemNotification('⚙️ পিক্সেল ও গুগল ট্যাগ ম্যানেজার এপিআই কী সক্রিয় এবং কানেক্ট করা হয়েছে!');
    setTimeout(() => {
      setIsSavedTracking(false);
    }, 4040);
  };

  // Courier booking overlay state
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [courierProvider, setCourierProvider] = useState<'Steadfast' | 'Pathao' | 'RedX'>('Steadfast');

  // Multi-select and bulk edit states for Orders
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Pending');

  // Filter products for POS
  const filteredProductsPos = products.filter(p => 
    p.name.toLowerCase().includes(searchPosQuery.toLowerCase()) || 
    (p.banglaName && p.banglaName.includes(searchPosQuery))
  );

  // Role Permissions Logic
  // Check if activeRole is authorized to view specific tab
  const checkPermission = (tab: typeof activeTab): { allowed: boolean; message: string } => {
    if (activeRole === 'Sales Staff') {
      if (tab !== 'pos' && tab !== 'orders') {
        return { allowed: false, message: 'দুঃখিত, শুধুমাত্র POS স্টাইলিস্ট এবং অর্ডার ম্যানেজমেন্ট দেখতে সেলস স্টাফ এর অনুমতি আছে।' };
      }
    }
    if (activeRole === 'Store Manager') {
      if (tab === 'settings' || tab === 'roles') {
        return { allowed: false, message: 'স্টোর পলিসি ও রোল ম্যানেজমেন্ট পরিচালনা করার এখতিয়ার শুধুমাত্র সিস্টেম সুপার এডমিনের।' };
      }
    }
    return { allowed: true, message: 'অনুমোদিত' };
  };

  const handleTabChange = (tab: typeof activeTab) => {
    const perm = checkPermission(tab);
    if (!perm.allowed) {
      triggerSystemNotification(`⚠️ ${perm.message}`);
      return;
    }
    setActiveTab(tab);
  };

  // Analytics helper variables
  const grossSales = orders.reduce((sum, o) => {
    if (o.status !== 'Cancelled') return sum + o.totalAmount;
    return sum;
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const deliverySuccessCount = orders.filter(o => o.status === 'Delivered').length;
  const fraudOrdersPrevented = orders.filter(o => o.fraudRiskScore >= 70).length;

  // Weekly Sales Revenue data aggregated for the past 7 days ending today (current week rolling list)
  const weeklySalesData = useMemo(() => {
    const daysList = [];
    const today = new Date();
    
    // Generate past 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      const dayNamesEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNamesBng = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const dayIdx = targetDate.getDay();
      
      const dateStr = targetDate.toISOString().split('T')[0];
      const simpleDate = `${targetDate.getDate()} ${targetDate.toLocaleString('default', { month: 'short' })}`;
      
      // Filter orders on this day
      const dayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const oDateStr = o.createdAt.split('T')[0];
        return oDateStr === dateStr && o.status !== 'Cancelled';
      });
      
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const count = dayOrders.length;
      
      daysList.push({
        dayName: dayNamesEng[dayIdx],
        banglaDay: dayNamesBng[dayIdx],
        label: `${dayNamesBng[dayIdx]} (${dayNamesEng[dayIdx]})`,
        revenue,
        ordersCount: count,
        dateLabel: simpleDate,
        date: dateStr
      });
    }
    
    return daysList;
  }, [orders]);

  // Category state for opening AddCategoryModal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Dynamic categories combined with custom database categories
  const allCategories = useMemo(() => {
    const names = Array.from(new Set([
      ...products.map(p => p.category),
      ...emptyCategories.map(c => typeof c === 'string' ? c : c?.name || '')
    ].filter(Boolean)));
    
    return names.map(n => {
      const match = emptyCategories.find(c => (typeof c === 'string' ? c : c?.name) === n);
      return {
        name: n,
        image: typeof match === 'object' && match ? match.image || '' : ''
      };
    });
  }, [products, emptyCategories]);

  // Support for string-based child components
  const categoryNames = useMemo(() => allCategories.map(c => c.name), [allCategories]);

  // Category management business logic
  const handleAddCategory = (name: string, imageUrl: string) => {
    if (!name.trim()) return;
    if (allCategories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      triggerSystemNotification('⚠️ এই ক্যাটাগরিটি ইতিমধ্যেই সংরক্ষিত তালিকায় আছে!');
      return;
    }
    setEmptyCategories(prev => [...prev, { name: name.trim(), image: imageUrl.trim() }]);
    triggerSystemNotification(`🏷️ নতুন ক্যাটাগরি '${name.trim()}' তৈরি করা হয়েছে!`);
  };

  const handleRenameCategory = (oldName: string, newName: string, newImage: string) => {
    if (!newName.trim()) return;

    setProducts(prev => prev.map(p => {
      if (p.category === oldName) {
        return { ...p, category: newName.trim() };
      }
      return p;
    }));

    setEmptyCategories(prev => {
      const filtered = prev.filter(c => (typeof c === 'string' ? c : c.name) !== oldName);
      return [...filtered, { name: newName.trim(), image: newImage }];
    });
    
    triggerSystemNotification(`🏷️ ক্যাটাগরি '${oldName}' সংশোধন করা হয়েছে!`);
  };

  const handleDeleteCategory = (catName: string, fallbackCat: string = 'অন্যান্য') => {
    if (catName === fallbackCat) return;

    // Check if the fallback category exists, if not, construct it in empty if needed
    if (!allCategories.some(c => c.name === fallbackCat)) {
      setEmptyCategories(prev => [
        ...prev.filter(c => (typeof c === 'string' ? c : c.name) !== catName),
        { name: fallbackCat, image: '' }
      ]);
    } else {
      setEmptyCategories(prev => prev.filter(c => (typeof c === 'string' ? c : c.name) !== catName));
    }

    setProducts(prev => prev.map(p => {
      if (p.category === catName) {
        return { ...p, category: fallbackCat };
      }
      return p;
    }));

    triggerSystemNotification(`❌ ক্যাটাগরি '${catName}' মুছে ফেলা হয়েছে এবং এর পণ্যসমূহ '${fallbackCat}' ক্যাটাগরিতে স্থানান্তরিত হয়েছে!`);
  };

  // POS Actions
  const addToPosCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('স্লট খালি! স্টক নেই।');
      return;
    }
    setPosCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromPosCart = (productId: string) => {
    setPosCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearPosAll = () => {
    setPosCart([]);
    setPosDiscount(0);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setPosCustomerAddress('');
  };

  const calculatePosTotal = () => {
    const subtotal = posCart.reduce((total, i) => total + (i.product.price * i.quantity), 0);
    const charge = posCustomerDistrict === 'Dhaka' ? 60 : 120;
    const finalAmount = Math.max(0, subtotal + charge - posDiscount);
    return { subtotal, charge, finalAmount };
  };

  const handlePosCheckout = () => {
    if (posCart.length === 0) {
      alert('কার্টে কোনো পণ্য নেই!');
      return;
    }
    if (!posCustomerName || !posCustomerPhone) {
      alert('দয়া করে ক্রেতার নাম এবং মোবাইল দিন!');
      return;
    }

    const { finalAmount } = calculatePosTotal();
    const orderId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerName: posCustomerName,
      phone: posCustomerPhone,
      address: posCustomerAddress || 'POS কাউন্টার সেল (হাতে হাতে)',
      district: posCustomerDistrict,
      items: [...posCart],
      totalAmount: finalAmount,
      paymentMethod: posPaymentType === 'Cash' ? 'Cash on Delivery' : (posPaymentType as any),
      paymentStatus: 'Paid',
      status: 'Delivered',
      createdAt: new Date().toISOString(),
      fraudRiskScore: 0,
       fraudReasons: []
    };

    // Deduct stock
    setProducts(prev => prev.map(p => {
      const posItem = posCart.find(i => i.product.id === p.id);
      if (posItem) {
        return { ...p, stock: Math.max(0, p.stock - posItem.quantity) };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    setShowThermalReceipt(newOrder); // Popup receipt print preview
    triggerSystemNotification(`🧾 POS রিসিট জেনারেট হয়েছে অর্ডার: ${orderId} এর জন্য।`);
    clearPosAll();
  };

  // Add Employee HRM
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPhone) return;

    const newEmp: Employee = {
      id: `EMP-0${employees.length + 1}`,
      name: newEmpName,
      role: newEmpRole,
      email: `${newEmpName.toLowerCase().replace(/\s/g, '')}@feelzonegifts.com`,
      phone: newEmpPhone,
      salary: newEmpSalary,
      attendanceRate: 100,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setEmployees(prev => [...prev, newEmp]);
    setShowAddEmployeeModal(false);
    triggerSystemNotification(`👤 নতুন কর্মী ${newEmpName} আমাদের ডোমেইনে নিয়োগ পেয়েছেন!`);
    
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpSalary(15000);
  };

  // Toggle Employee Status
  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const nextStatus = emp.status === 'Active' ? 'On Leave' : emp.status === 'On Leave' ? 'Suspended' : 'Active';
        return { ...emp, status: nextStatus };
      }
      return emp;
    }));
  };

  // Submit Bulk SMS Simulate
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsRecipient) return;

    const fullMessage = smsTemplate === 'Order Confirmation' 
      ? `প্রিয় কাস্টমার, FeelZone Fashion এ আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ!`
      : smsTemplate === 'Delivery Alert'
      ? `আপনার FeelZone Fashion পার্সেলটি নিয়ে আমাদের কুরিয়ার টিম আপনার ঠিকানার উদ্দেশ্যে রওনা হয়েছে। দ্রুত ডেলিভারি টিম আপনার সাথে ফোনে যোগাযোগ করবে।`
      : smsCustomMessage || 'FeelZone Fashion এর স্পেশাল অফার উপভোগ করুন!';

    const log: SMSLog = {
      id: `SMS-${Math.floor(10000 + Math.random() * 90000)}`,
      recipient: smsRecipient,
      message: fullMessage,
      status: 'Sent',
      timestamp: new Date().toISOString(),
      type: smsTemplate as any
    };

    setSmsLogs(prev => [log, ...prev]);
    triggerSystemNotification(`💬 SMS সফলভাবে পাঠানো হয়েছে: ${smsRecipient}`);
    
    // reset SMS
    setSmsRecipient('');
    setSmsCustomMessage('');
  };

  // Bulk Quick SMS Promotional Blast
  const handlePromoSmsBlast = () => {
    const clients = orders.map(o => o.phone).filter((v, i, self) => self.indexOf(v) === i);
    if (clients.length === 0) {
      alert('তালিকায় কোনো কাস্টমার নাম্বার পাওয়া যায়নি!');
      return;
    }

    const blastLogs: SMSLog[] = clients.map(phone => ({
      id: `SMS-BL-${Math.floor(10000 + Math.random() * 90000)}`,
      recipient: phone,
      message: `FeelZone Fashion ধামাকা অফার! প্রিয়জনদের জন্য ১০০০ টাকার স্পেশাল কাস্টমাইজড ফ্রেম কেনাকাটায় ফ্রি আকর্ষণীয় চাবির রিং পাচ্ছেন উপহারস্বরূপ! এখনই ভিজিট করুন আমাদের স্টোরে।`,
      status: 'Sent',
      timestamp: new Date().toISOString(),
      type: 'Promo'
    }));

    setSmsLogs(prev => [...blastLogs, ...prev]);
    triggerSystemNotification(`🔥 এক ক্লিকে ${clients.length} টি নাম্বারে প্রোমোশনাল SMS ব্লাস্ট করা হয়েছে!`);
  };

  // Courier booking system trigger
  const handleCourierBooking = () => {
    if (!bookingOrder) return;

    const mockCarrierId = courierProvider === 'Steadfast' 
      ? `SF-${Math.floor(100000 + Math.random() * 900000)}` 
      : courierProvider === 'Pathao'
      ? `PTH-${Math.floor(100000 + Math.random() * 900000)}`
      : `RED-${Math.floor(100000 + Math.random() * 900000)}`;

    const trackingNum = `TRK-${courierProvider.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setOrders(prev => prev.map(o => {
      if (o.id === bookingOrder.id) {
        return {
          ...o,
          status: 'Shipped',
          courierName: courierProvider,
          courierId: mockCarrierId,
          trackingNumber: trackingNum,
          paymentStatus: o.paymentStatus
        };
      }
      return o;
    }));

    triggerSystemNotification(`🚚 কুরিয়ার বুকিং সম্পন্ন হয়েছে ট্র্যাকিং নং: ${trackingNum}`);
    setBookingOrder(null);
  };

  const countPending = orders.filter(o => o.status === 'Pending').length;
  const countProcessing = orders.filter(o => o.status === 'Confirmed' || o.status === 'Shipped').length;
  const countCompleted = orders.filter(o => o.status === 'Delivered').length;
  const countCancelled = orders.filter(o => o.status === 'Cancelled').length;
  const totalOrdersCount = orders.length;

  const pctPending = totalOrdersCount > 0 ? Math.round((countPending / totalOrdersCount) * 100) : 15;
  const pctProcessing = totalOrdersCount > 0 ? Math.round((countProcessing / totalOrdersCount) * 100) : 29;
  const pctCompleted = totalOrdersCount > 0 ? Math.round((countCompleted / totalOrdersCount) * 100) : 42;
  const pctCancelled = totalOrdersCount > 0 ? Math.round((countCancelled / totalOrdersCount) * 100) : 14;

  const radius = 35;
  const circ = 2 * Math.PI * radius; // ~219.9
  const strokeCompleted = (pctCompleted / 100) * circ;
  const strokePending = (pctPending / 100) * circ;
  const strokeProcessing = (pctProcessing / 100) * circ;
  const strokeCancelled = (pctCancelled / 100) * circ;

  const offsetCompleted = 0;
  const offsetPending = strokeCompleted;
  const offsetProcessing = strokeCompleted + strokePending;
  const offsetCancelled = strokeCompleted + strokePending + strokeProcessing;

  const getTabLabel = (tab: string) => {
    switch(tab) {
      case 'analytics': return 'Dashboard';
      case 'products': return 'Products Inventory';
      case 'pos': return 'POS Terminal';
      case 'orders': return 'Orders & Fraud';
      case 'courier': return 'Courier';
      case 'categories': return 'Categories';
      case 'hrm': return 'Human Resources';
      case 'landing': return 'Landing Pages';
      case 'roles': return 'Access Roles';
      case 'settings': return 'Settings';
      default: return tab;
    }
  };

  return (
    <div className="bg-[#f4f5f8] text-slate-800 min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#111125] text-[#b3b4db] p-5 flex flex-col justify-between shrink-0 space-y-6 border-r border-indigo-950/20">
        <div className="space-y-6">
          
          {/* Main Logo Admin */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wide flex items-center">
                Admin<span className="text-zinc-400 font-medium">Pro</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-extrabold block uppercase tracking-wider">Merchant Portal</span>
            </div>
          </div>

          {/* Quick Role switcher sidebar element */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between text-[9px] text-[#9b9cae] font-extrabold uppercase tracking-wider">
              <span>সিস্টেম অ্যাক্সেস রোল:</span>
            </div>
            <select
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value as UserRole);
                triggerSystemNotification(`🔑 রোল পরিবর্তন কারী: ${e.target.value}`);
              }}
              className="w-full bg-zinc-950 text-[11px] font-bold text-indigo-400 py-1 px-2 rounded focus:outline-none border border-zinc-805/80 cursor-pointer"
            >
              <option value="Super Admin">Super Admin (সম্পূর্ণ)</option>
              <option value="Store Manager">Store Manager (ম্যানেজার)</option>
              <option value="Sales Staff">Sales Staff (কাউন্টার)</option>
            </select>
          </div>

          {/* Nav Elements */}
          <nav className="flex flex-col gap-5">
            <div>
              <span className="text-[10px] text-zinc-500 font-extrabold tracking-widest block uppercase mb-2">MANAGE</span>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'pos', label: 'POS Terminal', icon: Receipt },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'orders', label: 'Orders & Fraud', icon: ShieldAlert },
                  { id: 'categories', label: 'Categories', icon: Grid3X3 },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as any)}
                      className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold' 
                          : 'text-[#9b9cae] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-500 font-extrabold tracking-widest block uppercase mb-2">TOOLS</span>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
                  { id: 'courier', label: 'Courier Integration', icon: Truck },
                  { id: 'hrm', label: 'Human Resource', icon: UsersRound },
                  { id: 'landing', label: 'Ready Landings', icon: Sparkles },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as any)}
                      className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold' 
                          : 'text-[#9b9cae] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-500 font-extrabold tracking-widest block uppercase mb-2">SETTINGS</span>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'roles', label: 'Roles & Access', icon: UserCog },
                  { id: 'settings', label: 'System Settings', icon: Settings }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as any)}
                      className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold' 
                          : 'text-[#9b9cae] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Upgrade to Pro banner matching design */}
        <div className="space-y-3">
          <div className="bg-gradient-to-tr from-indigo-950/60 to-purple-950/60 border border-indigo-900/40 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-md text-[9px] w-fit">
              <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Upgrade to Pro
            </div>
            <h3 className="text-white font-extrabold text-xs mt-2">Unlock all features & get priority support!</h3>
            <button 
              onClick={() => alert('সিস্টেম সুপার চার্জ প্যানেল আপগ্রেড সেশন শীঘ্রই শুরু হতে যাচ্ছে!')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg transition-all mt-3 cursor-pointer shadow-sm shadow-indigo-600/20"
            >
              Upgrade Now
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-[#fa3c65]/10 hover:bg-[#f93c65] border border-rose-500/20 hover:border-rose-500 text-[#f93c65] hover:text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer select-none"
            id="admin-sidebar-logout-btn"
          >
            <Lock className="w-3.5 h-3.5" /> লগআউট করুন (Log Out)
          </button>

          {/* Info footer */}
          <div className="border-t border-zinc-900 pt-4 space-y-0.5 text-[9px] text-zinc-500 font-mono">
            <p>AdminPro Active Session</p>
            <p>v3.4.6 • Safe State</p>
          </div>
        </div>
      </aside>

      {/* Main Admin Content & Header Panel */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-zinc-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Hamburger menu for small screens */}
            <button className="md:hidden text-slate-600 p-1 rounded-lg hover:bg-slate-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">{getTabLabel(activeTab)}</h1>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">
                Home / <span className="text-indigo-600">{activeTab}</span>
              </div>
            </div>
          </div>

          {/* Search box corresponding to AdminPro */}
          <div className="relative w-full sm:max-w-xs">
            <input 
              type="text" 
              placeholder="Search here..." 
              className="w-full bg-slate-50 border border-slate-200/50 text-slate-700 text-xs rounded-xl pl-9 pr-14 py-2 focus:outline-none focus:border-indigo-400"
              id="global-header-search"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <span className="absolute right-3 top-2 bg-white border border-slate-200 rounded px-1 text-[8px] text-slate-400 font-mono select-none">
              Ctrl + /
            </span>
          </div>

          {/* Right side notification and user details */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </button>

            <div className="relative">
              <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-swing" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute top-1.5 right-1.5 bg-[#5c4cf4] text-[8px] font-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90 select-none shadow-sm shadow-[#5c4cf4]/30">
                5
              </span>
            </div>

            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition hidden sm:inline-block cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120" 
                  alt="admin user" 
                  className="w-8 h-8 rounded-full object-cover border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left">
                  <span className="font-extrabold text-slate-800 block text-xs leading-none">{activeRole}</span>
                  <span className="text-[9px] text-[#5c4cf4] block font-bold uppercase tracking-wider mt-0.5">সাজানো সেশন</span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition cursor-pointer select-none"
                id="admin-header-logout-btn"
              >
                লগআউট (Logout)
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Frame Container with paddings */}
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
          
          {/* Dynamic Analytics Tab View */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Upper Metric Widgets Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { title: 'Total Users', value: (12540 + orders.length * 3).toLocaleString(), growth: '▲ 12.5% vs last month', p: 'bg-[#eeeeff] text-[#7a60f9]', icon: Users },
                  { title: 'Total Orders', value: (8450 + orders.length).toLocaleString(), growth: '▲ 8.2% vs last month', p: 'bg-[#e5f1ff] text-[#247efd]', icon: ShoppingBag },
                  { title: 'Total Revenue', value: `৳${(grossSales + 48650).toLocaleString()}`, growth: '▲ 15.3% vs last month', p: 'bg-[#e6fbf1] text-[#10b981]', icon: DollarSign },
                  { title: 'Total Products', value: (1235 + products.length).toLocaleString(), growth: '▲ 6.4% vs last month', p: 'bg-[#fff5e6] text-[#fca130]', icon: Truck },
                  { title: 'Total Visits', value: (32450 + products.length * 8 + orders.length * 3).toLocaleString(), growth: '▲ 9.5% vs last month', p: 'bg-[#ffebee] text-[#f93c65]', icon: Eye }
                ].map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm shadow-slate-100/40 hover:translate-y-[-2px] transition-all" key={idx}>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${m.p}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">{m.title}</span>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">{m.value}</h4>
                        <span className="text-[9px] text-emerald-500 font-extrabold block">{m.growth}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Trend Splines and Status Splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Overview left spline graph */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">Sales Overview</h3>
                      <p className="text-slate-400 text-xs text-[10px] font-bold uppercase tracking-wider font-mono">Weekly sales index trend</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer">
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>

                  <div className="w-full h-64 pt-4 relative">
                    {/* Glowing graph line and gradient fill */}
                    <svg viewBox="0 0 500 200" className="w-full h-full text-slate-300 overflow-visible">
                      <defs>
                        <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Horiz line grids */}
                      <line x1="10" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3" />
                      <line x1="10" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="3" />
                      <line x1="10" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="3" />
                      <line x1="10" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="3" />
                      <line x1="10" y1="170" x2="480" y2="170" stroke="#e2e8f0" />

                      {/* Area beneath spline */}
                      <path 
                        d="M 20 150 Q 80 80, 140 110 T 260 70 T 380 90 T 465 40 L 465 170 L 20 170 Z" 
                        fill="url(#glowGrad)" 
                      />

                      {/* Pure curved SVG spline line corresponding to the chart in AdminPro mockup */}
                      <path 
                        d="M 20 150 Q 80 80, 140 110 T 260 70 T 380 90 T 465 40" 
                        fill="none" 
                        stroke="#4f46e5" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Grid node circles */}
                      <circle cx="20" cy="150" r="4.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
                      <circle cx="140" cy="110" r="4.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
                      <circle cx="260" cy="70" r="5" fill="#2bd47e" stroke="white" strokeWidth="2" />
                      <circle cx="380" cy="90" r="4.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
                      
                      {/* Selected dot with heavy white anchor */}
                      <circle cx="465" cy="40" r="6" fill="#4f46e5" stroke="white" strokeWidth="2.5" className="shadow" />

                      {/* X Axis Texts */}
                      <text x="20" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">1 May</text>
                      <text x="90" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">5 May</text>
                      <text x="160" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">10 May</text>
                      <text x="230" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">15 May</text>
                      <text x="300" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">20 May</text>
                      <text x="370" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">25 May</text>
                      <text x="440" y="190" fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold font-mono">30 May</text>

                      {/* Y Legends */}
                      <text x="490" y="24" fill="#94a3b8" textAnchor="start" className="text-[9px] font-bold font-mono">50K</text>
                      <text x="490" y="64" fill="#94a3b8" textAnchor="start" className="text-[9px] font-bold font-mono">40K</text>
                      <text x="490" y="104" fill="#94a3b8" textAnchor="start" className="text-[9px] font-bold font-mono">30K</text>
                      <text x="490" y="144" fill="#94a3b8" textAnchor="start" className="text-[9px] font-bold font-mono">20K</text>
                      <text x="490" y="174" fill="#94a3b8" textAnchor="start" className="text-[9px] font-bold font-mono">10K</text>

                      {/* Interactive glowing tooltip overlay corresponding strictly to AdminPro visual style */}
                      <g transform="translate(230, 15)">
                        <rect x="0" y="0" width="75" height="38" rx="8" fill="#4f46e5" className="shadow-lg" />
                        <text x="37" y="16" fill="white" textAnchor="middle" className="text-[9px] font-extrabold font-sans">৳২৩,৮৫০</text>
                        <text x="37" y="28" fill="#c7d2fe" textAnchor="middle" className="text-[7.5px] font-bold font-mono">15 May, 2026</text>
                        <polygon points="34,38 41,38 37,42" fill="#4f46e5" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Orders by status rounded Split wheel */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-800">Orders by Status</h3>
                      <p className="text-slate-400 text-xs text-[10px] font-bold uppercase tracking-wider font-mono">All-time order proportions</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer">
                      <option>This Month</option>
                      <option>This Week</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                    {/* Centered Donut pie container */}
                    <div className="relative w-36 h-36 mx-auto">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="rotate-[-90deg]">
                        {/* Base tray ring */}
                        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                        
                        {/* Completed (Green) */}
                        {strokeCompleted > 0 && (
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#10b981" strokeWidth="12"
                                  strokeDasharray={`${strokeCompleted} ${circ}`}
                                  strokeDashoffset={-offsetCompleted}
                          />
                        )}

                        {/* Pending (Orange) */}
                        {strokePending > 0 && (
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#ffa130" strokeWidth="12"
                                  strokeDasharray={`${strokePending} ${circ}`}
                                  strokeDashoffset={-offsetPending}
                          />
                        )}

                        {/* Processing (Blue) */}
                        {strokeProcessing > 0 && (
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#247efd" strokeWidth="12"
                                  strokeDasharray={`${strokeProcessing} ${circ}`}
                                  strokeDashoffset={-offsetProcessing}
                          />
                        )}

                        {/* Cancelled (Red) */}
                        {strokeCancelled > 0 && (
                          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f93c65" strokeWidth="12"
                                  strokeDasharray={`${strokeCancelled} ${circ}`}
                                  strokeDashoffset={-offsetCancelled}
                          />
                        )}
                      </svg>
                      {/* Total overlay in exact middle */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-800 leading-none">{(8450 + totalOrdersCount).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Total</span>
                      </div>
                    </div>

                    {/* Slices label legends */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffa130]" /> Pending
                        </span>
                        <span className="font-extrabold text-[#ffa130]">{(1250 + countPending).toLocaleString()} ({pctPending}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#247efd]" /> Processing
                        </span>
                        <span className="font-extrabold text-[#247efd]">{(3450 + countProcessing).toLocaleString()} ({pctProcessing}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                        <span className="font-extrabold text-emerald-500">{(4620 + countCompleted).toLocaleString()} ({pctCompleted}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Cancelled
                        </span>
                        <span className="font-extrabold text-rose-500">{(1130 + countCancelled).toLocaleString()} ({pctCancelled}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Sales Revenue Bar Chart (Recharts) */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800">সাপ্তাহিক বিক্রয় রেভিনিউ (Daily Sales Revenue)</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider font-mono">Current week sales performance trends of past 7 days</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 py-1 px-3 rounded-xl">
                    <span className="w-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[10px] uppercase font-mono tracking-wider">LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Chart Container */}
                  <div className="lg:col-span-3 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={weeklySalesData} 
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="dayName" 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          fontWeight={600} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10} 
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          fontSize={11} 
                          fontWeight={600} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `৳${val.toLocaleString()}`}
                          dx={-5}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                        <Bar 
                          dataKey="revenue" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={45}
                        >
                          {weeklySalesData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.revenue > 0 ? '#4f46e5' : '#e2e8f0'} 
                              fillOpacity={entry.revenue > 0 ? 0.9 : 0.5}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Metrics */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center space-y-4 shadow-sm shadow-slate-100/50">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200/60 pb-2">সাপ্তাহিক সংক্ষিপ্তসার</h4>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Total Sales</span>
                      <div className="text-xl font-black text-slate-800">
                        ৳{weeklySalesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                      </div>
                      <span className="text-[9px] text-emerald-500 font-extrabold block">▲ Active Week Aggregation</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Daily Average</span>
                      <div className="text-base font-black text-slate-700">
                        ৳{Math.round(weeklySalesData.reduce((sum, d) => sum + d.revenue, 0) / 7).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Peak Performance</span>
                      <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{[...weeklySalesData].sort((a,b) => b.revenue - a.revenue)[0]?.banglaDay || 'N/A'}</span>
                        <span className="font-extrabold text-indigo-600 font-mono">
                          ৳{[...weeklySalesData].sort((a,b) => b.revenue - a.revenue)[0]?.revenue.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 3 Columns representing the third panel block of AdminPro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Recent Orders List Column Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-slate-800">Recent Orders</h3>
                      <button 
                        onClick={() => handleTabChange('orders')}
                        className="text-xs text-indigo-650 font-bold hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {orders.slice(0, 5).map((order, idx) => {
                        const colors = [
                          'bg-indigo-150 text-indigo-750 font-bold',
                          'bg-amber-100 text-amber-850 font-bold',
                          'bg-emerald-100 text-emerald-850 font-bold',
                          'bg-rose-100 text-rose-850 font-bold',
                          'bg-blue-100 text-blue-805 font-bold'
                        ];
                        const randomColorClass = colors[idx % colors.length];
                        const firstChar = order.customerName ? order.customerName.charAt(0) : 'G';
                        return (
                          <div className="flex items-center justify-between text-xs" key={order.id}>
                            <div className="flex items-center gap-2.5">
                              {/* Avatar design */}
                              <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs uppercase ${randomColorClass}`}>
                                {firstChar}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block leading-tight">{order.customerName}</span>
                                <span className="text-[10px] text-zinc-400 font-mono block">#{order.id}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-slate-800 block text-xs">৳{order.totalAmount}</span>
                              <span className={`inline-block py-0.5 px-2 rounded-full text-[9px] font-bold scale-90 ${
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                                order.status === 'Pending' ? 'bg-amber-5 text-amber-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {orders.length === 0 && (
                        <p className="text-zinc-400 text-center text-xs py-10 italic">কোনো অর্ডার পাওয়া যায়নি।</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Products List Column Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-slate-800">Top Products</h3>
                      <button 
                        onClick={() => handleTabChange('products')}
                        className="text-xs text-indigo-650 font-bold hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {products.slice(0, 5).map((p) => {
                        const salesCount = Math.abs(p.sku.length * 27) + p.stock;
                        return (
                          <div className="flex items-center justify-between text-xs" key={p.id}>
                            <div className="flex items-center gap-2.5">
                              <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg border border-slate-100" referrerPolicy="no-referrer" />
                              <div className="space-y-0.5 max-w-[120px]">
                                <span className="font-bold text-slate-800 block leading-tight truncate">{p.banglaName || p.name}</span>
                                <span className="text-[10px] text-zinc-400 font-bold block">{salesCount} Sales</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-indigo-600 block">৳{(p.price * salesCount).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                      {products.length === 0 && (
                        <p className="text-zinc-400 text-center text-xs py-10 italic">কোনো পণ্য পাওয়া যায়নি।</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activities Feed corresponding to AdminPro */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-sm text-slate-800">Recent Activity</h3>
                    </div>

                    <div className="space-y-4 relative pl-3 border-l border-zinc-150 py-1">
                      <div className="space-y-0.5 relative">
                        <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full bg-[#7a60f9] border border-white" />
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider font-mono">2 mins ago</span>
                        <h4 className="font-bold text-slate-800 text-xs">New user registered</h4>
                        <p className="text-[10px] text-slate-500">John Doe joined the platform</p>
                      </div>

                      <div className="space-y-0.5 relative">
                        <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full bg-[#247efd] border border-white" />
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider font-mono">10 mins ago</span>
                        <h4 className="font-bold text-slate-800 text-xs">New order received</h4>
                        <p className="text-[10px] text-slate-500">Order #ORD-{orders[0]?.id || '2548'} has been approved</p>
                      </div>

                      <div className="space-y-0.5 relative">
                        <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full bg-[#fca130] border border-white" />
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider font-mono">25 mins ago</span>
                        <h4 className="font-bold text-slate-800 text-xs">Product inventory updated</h4>
                        <p className="text-[10px] text-slate-505">{products[0]?.name || 'Fashion Items'} stock verified</p>
                      </div>

                      <div className="space-y-0.5 relative">
                        <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider font-mono">1 hour ago</span>
                        <h4 className="font-bold text-slate-800 text-xs">Payment received</h4>
                        <p className="text-[10px] text-slate-500">Payment of ৳{(orders[0]?.totalAmount || 250).toLocaleString()} received successfully</p>
                      </div>

                      <div className="space-y-0.5 relative">
                        <span className="absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full bg-[#f93c65] border border-white" />
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider font-mono">2 hours ago</span>
                        <h4 className="font-bold text-slate-800 text-xs">Courier report generated</h4>
                        <p className="text-[10px] text-slate-505">Active Steadfast manifest generated</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Products catalog inside reports */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm shadow-slate-100/40">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800">ইনভেন্টরি ও প্রডাক্ট তালিকা ({products.length} টি পণ্য)</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-400 text-xs">স্টক রিয়েল-টাইম কন্ট্রোল ইন্টিলিজেন্স</p>
                      <span className="hidden sm:inline text-slate-200">|</span>
                      <div className="flex items-center gap-1 bg-amber-50/55 border border-amber-200 py-0.5 px-2 rounded-lg text-[10px] font-bold text-amber-850 select-none">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>সতর্কবার্তা লিমিট:</span>
                        <button 
                          onClick={() => {
                            setAdminLowStockThreshold(prev => Math.max(1, prev - 1));
                            triggerSystemNotification(`📉 ড্যাশবোর্ড সর্তকতা লিমিট ${Math.max(1, adminLowStockThreshold - 1)} টি করা হয়েছে`);
                          }}
                          className="w-4 h-4 bg-white hover:bg-slate-150 text-slate-750 border border-slate-200 rounded flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-indigo-700 px-1">{adminLowStockThreshold}</span>
                        <button 
                          onClick={() => {
                            setAdminLowStockThreshold(prev => Math.min(100, prev + 1));
                            triggerSystemNotification(`📈 ড্যাশবোর্ড সর্তকতা লিমিট ${Math.min(100, adminLowStockThreshold + 1)} টি করা হয়েছে`);
                          }}
                          className="w-4 h-4 bg-white hover:bg-slate-150 text-slate-750 border border-slate-200 rounded flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" /> নতুন প্রডাক্ট যোগ করুন
                  </button>
                </div>

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
                      {products.map(p => {
                        const isLowStock = p.stock > 0 && p.stock <= adminLowStockThreshold;
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
                                p.stock > adminLowStockThreshold ? 'bg-emerald-50 text-emerald-600' 
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
                              {adminDeleteConfirmId === p.id ? (
                                <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg">
                                  <button
                                    onClick={() => {
                                      setProducts(prev => prev.map(prod => prod.id === p.id ? null as any : prod).filter(Boolean));
                                      triggerSystemNotification(`🗑 '${p.banglaName || p.name}' ডিলিট সফল হয়েছে।`);
                                      setAdminDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-1 text-[10px] bg-rose-650 hover:bg-rose-700 text-white rounded font-bold transition cursor-pointer font-sans"
                                    id={`admin-confirm-delete-yes-${p.id}`}
                                  >
                                    হ্যাঁ
                                  </button>
                                  <button
                                    onClick={() => setAdminDeleteConfirmId(null)}
                                    className="px-2 py-1 text-[10px] bg-white text-slate-550 border border-slate-200 rounded font-bold hover:bg-slate-50 transition cursor-pointer font-sans"
                                    id={`admin-confirm-delete-no-${p.id}`}
                                  >
                                    না
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setAdminDeleteConfirmId(p.id)}
                                  title="মুছে ফেলুন"
                                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                  id={`admin-delete-btn-${p.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        {/* Dedicated Products view */}
        {activeTab === 'products' && (
          <div className="animate-fadeIn">
            <ProductList
              products={products}
              setProducts={setProducts}
              categories={categoryNames}
              triggerSystemNotification={triggerSystemNotification}
            />
          </div>
        )}

        {/* Dynamic POS Dashboard View */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Products grid selection panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-white">POS (Point of Sale) টার্মিনাল</h2>
                  <p className="text-xs text-zinc-400">ক্লিক করে ক্রেতার বাস্কেটে আইটেম যোগ করুন</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <input 
                    type="text" 
                    placeholder="পণ্য দ্রুত বাজি ধরুন..." 
                    value={searchPosQuery}
                    onChange={(e) => setSearchPosQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border bg-zinc-900 border-zinc-800 text-zinc-200 text-xs rounded-xl focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProductsPos.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToPosCart(p)}
                    className={`bg-zinc-900 border text-left p-3.5 rounded-2xl flex flex-col justify-between hover:border-teal-500 hover:bg-zinc-900/50 transition relative group cursor-pointer ${
                      p.stock === 0 ? 'opacity-40 pointer-events-none' : 'border-zinc-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-white truncate">{p.banglaName || p.name}</h4>
                        <span className="text-[9px] text-zinc-500">Stock: {p.stock} pcs</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-zinc-800/55 w-full">
                      <span className="text-teal-400 font-extrabold text-xs">৳{p.price}</span>
                      <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-bold">যোগ করুন +</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* POS cart drawer checkout right panel */}
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-fit min-h-[500px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-400 flex items-center gap-1">
                    <Receipt className="w-4 h-4" /> কাউন্টার ঝুড়ি
                  </h3>
                  <button 
                    onClick={clearPosAll}
                    className="text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase transition"
                  >
                    ঝুড়ি সাফ করুন
                  </button>
                </div>

                {/* Items loop */}
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {posCart.length === 0 ? (
                    <p className="text-center text-xs text-zinc-500 py-12">কাউন্টার ঝুড়ি সম্পূর্ণ খালি!</p>
                  ) : (
                    posCart.map(item => (
                      <div className="flex gap-2 justify-between items-center bg-zinc-950 p-2 border border-zinc-800 rounded-xl" key={item.product.id}>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white font-bold truncate">{item.product.banglaName || item.product.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{item.quantity} x ৳{item.product.price} = ৳{item.quantity * item.product.price}</p>
                        </div>
                        <button 
                          onClick={() => removeFromPosCart(item.product.id)}
                          className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-500/10 rounded transition"
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Customer Details info */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">ক্রেতার বিবরণী:</span>
                  <input 
                    type="text" 
                    placeholder="ক্রেতার নাম (যেমন: মোঃ রাসেল)" 
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full bg-zinc-955 px-3 py-1.5 text-xs text-white border border-zinc-800 focus:outline-none rounded-lg"
                  />
                  <input 
                    type="tel" 
                    placeholder="মোবাইল নাম্বার (১১ ডিজিট)" 
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    maxLength={11}
                    className="w-full bg-zinc-955 px-3 py-1.5 text-xs text-white border border-zinc-800 focus:outline-none rounded-lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-zinc-500 block mb-0.5">ডেলিভারি জেলা:</span>
                      <select 
                        value={posCustomerDistrict}
                        onChange={(e) => setPosCustomerDistrict(e.target.value)}
                        className="w-full bg-zinc-955 p-1 text-[11px] text-teal-400 border border-zinc-800 focus:outline-none rounded font-bold"
                      >
                        {BANGLADESH_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block mb-0.5">পেমেন্ট টাইপ:</span>
                      <select 
                        value={posPaymentType}
                        onChange={(e) => setPosPaymentType(e.target.value as any)}
                        className="w-full bg-zinc-955 p-1 text-[11px] text-teal-400 border border-zinc-800 focus:outline-none rounded font-bold"
                      >
                        <option value="Cash">Cash (নগদ)</option>
                        <option value="bKash">bKash (বিকাশ)</option>
                        <option value="Nagad">Nagad (নগদ)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-zinc-500 block mb-1">ক্যাশ ডিসকাউন্টার (৳ ফ্ল্যাট ছাড়):</span>
                    <input 
                      type="number" 
                      placeholder="টাকা লিখুন" 
                      value={posDiscount || ''}
                      onChange={(e) => setPosDiscount(Number(e.target.value))}
                      className="w-24 bg-zinc-955 px-3 py-1 text-xs text-white border border-zinc-800 focus:outline-none rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Subtotal, bills, execute checkout */}
              <div className="border-t border-zinc-800 pt-4 space-y-3 mt-4">
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>প্রোডাক্টস সাবটোটাল:</span>
                    <span className="font-bold text-white font-mono">৳{calculatePosTotal().subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>কুরিয়ার চার্জ:</span>
                    <span className="font-bold text-white font-mono">৳{calculatePosTotal().charge}</span>
                  </div>
                  {posDiscount > 0 && (
                    <div className="flex justify-between text-yellow-500">
                      <span>ক্লিন ডিসকাউন্ট:</span>
                      <span className="font-bold font-mono">-৳{posDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-teal-400 pt-1.5 border-t border-zinc-800/60 mt-1.5">
                    <span>মোট আদায়যোগ্য বিল:</span>
                    <span className="text-lg font-mono">৳{calculatePosTotal().finalAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handlePosCheckout}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1 tracking-wider shadow-lg capitalize cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> রিসেপশন ও ক্যাশ আউট জেনারেট
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Orders & Fraud Protection System Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-black text-white">অর্ডার পোর্টাল ও ফ্রড ডিটেকশন সিস্টেম</h2>
              <p className="text-xs text-zinc-400">বাংলাদেশের ঝুঁকি পূর্বাভাস ও ফ্রড প্রোটেকশন অ্যানালাইসিস</p>
            </div>

            {/* Bulk Actions Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">একত্রে অর্ডার আপডেট (Bulk Actions)</h3>
                  <p className="text-[11px] text-zinc-400">
                    {selectedOrderIds.length > 0 
                      ? `মোট ${selectedOrderIds.length} টি অর্ডার সিলেক্ট করা হয়েছে` 
                      : 'অর্ডারগুলো সিলেক্ট করে একসাথে স্থিতি পরিবর্তন করুন'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                  className="bg-zinc-950 text-xs py-1.5 px-3 border border-zinc-800 text-teal-300 rounded-lg font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  disabled={selectedOrderIds.length === 0}
                  onClick={() => {
                    setOrders(prev => prev.map(ord => selectedOrderIds.includes(ord.id) ? { ...ord, status: bulkStatus } : ord));
                    triggerSystemNotification(`🔄 সফলভাবে ${selectedOrderIds.length} টি অর্ডারের স্থিতি '${bulkStatus}' এ পরিবর্তন করা হয়েছে!`);
                    setSelectedOrderIds([]);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedOrderIds.length > 0
                      ? 'bg-indigo-650 hover:bg-indigo-750 text-white cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  আপডেট স্থিতি (Apply)
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrderIds(orders.map(o => o.id));
                          } else {
                            setSelectedOrderIds([]);
                          }
                        }}
                        className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-550 focus:ring-offset-0 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="py-3 px-3">অর্ডার আইডি</th>
                    <th className="py-3 px-3">গ্রাহক ও মোবাইল</th>
                    <th className="py-3 px-3">বিল অ্যামাউন্ট</th>
                    <th className="py-3 px-3">পেমেন্ট মোড</th>
                    <th className="py-3 px-3">অবস্থা (Status)</th>
                    <th className="py-3 px-3">ফ্রড রিস্ক ইন্টেলিজেন্ট</th>
                    <th className="py-3 px-3">কন্ট্রোল অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-zinc-800/40 hover:bg-zinc-850/20 text-zinc-300">
                      <td className="py-4 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(o.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(p => [...p, o.id]);
                            } else {
                              setSelectedOrderIds(p => p.filter(id => id !== o.id));
                            }
                          }}
                          className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-550 focus:ring-offset-0 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-teal-400">{o.id}</td>
                      <td className="py-4 px-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{o.customerName}</span>
                          <span className="text-[10px] text-zinc-500 block italic">{o.address}, {o.district}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block">{o.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-white">৳{o.totalAmount}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${
                          o.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {o.paymentMethod} ({o.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'})
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            const nextStat = e.target.value as any;
                            setOrders(prev => prev.map(ord => ord.id === o.id ? { ...ord, status: nextStat } : ord));
                            triggerSystemNotification(`🔄 অর্ডার ${o.id} এর স্থিতি করা হয়েছে: ${nextStat}`);
                          }}
                          className="bg-zinc-950 text-xs py-1 px-1.5 border border-zinc-800 text-teal-300 rounded font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <div className="flex gap-1 items-center">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              o.fraudRiskScore >= 70 ? 'bg-red-500 animate-pulse' 
                              : o.fraudRiskScore >= 30 ? 'bg-amber-400' 
                              : 'bg-green-500'
                            }`}></span>
                            <span className="font-mono text-xs font-bold text-white">{o.fraudRiskScore}% Risk</span>
                          </div>
                          {o.fraudReasons.length > 0 && (
                            <div className="text-[9px] text-zinc-500 space-y-0.5">
                              {o.fraudReasons.slice(0, 1).map((r, i) => (
                                <p className="truncate max-w-[150px]" key={i} title={r}>• {r}</p>
                              ))}
                              {o.fraudReasons.length > 1 && <span className="text-teal-500 block">+{o.fraudReasons.length - 1} টি কারণ</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex gap-1">
                          {/* Alert info trigger */}
                          {o.fraudReasons.length > 0 && (
                            <button 
                              onClick={() => {
                                alert(`ফ্রড এনালাইসিস রিপোর্টিং - অর্ডার: ${o.id}\n\nঝুঁকি স্কোর: ${o.fraudRiskScore}%\n\nচিহ্নিত কারণসমূহ:\n` + o.fraudReasons.map((r, i) => `${i+1}. ${r}`).join('\n'));
                              }}
                              className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold p-1 rounded transition text-zinc-300"
                              title="ফ্রড কারণসমূহ দেখুন"
                            >
                              🔍 ফ্রড রিপোর্ট
                            </button>
                          )}
                          
                          {/* Ship triggers courier block setup */}
                          {o.status === 'Pending' && (
                            <button 
                              onClick={() => {
                                setBookingOrder(o);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 text-xs rounded transition flex items-center gap-0.5"
                            >
                              <Truck className="w-3 h-3" /> বুকিং কুরিয়ার
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Courier carriers API Integration Tab */}
        {activeTab === 'courier' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" /> বাংলাদেশ কুরিয়ার সার্ভিস ইন্টিগ্রেশন
                </h2>
                <p className="text-xs text-zinc-400">একটি সিঙ্গেল প্যানেল থেকে Steadfast, Pathao, RedX বুকিং ট্র্যাকিং লেবেল জেনারেশন</p>
              </div>

              {/* Sub-tabs buttons */}
              <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setCourierSubTab('dispatches')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    courierSubTab === 'dispatches' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  চলমান বুকিং তালিকা ({orders.filter(o => o.courierName).length})
                </button>
                <button
                  onClick={() => setCourierSubTab('settings')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    courierSubTab === 'settings' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  এপিআই কানেকশন সেটিংস ⚙
                </button>
              </div>
            </div>

            {courierSubTab === 'settings' ? (
              <div className="animate-fadeIn">
                <CourierSettingsPanel triggerSystemNotification={triggerSystemNotification} />
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Steadfast Courier', desc: 'সারা বাংলাদেশ ক্যাশ অন ডেলিভারি (COD) পেমেন্ট ক্লিয়ারেন্স ১ কর্মদিবসে!', img: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=300', speed: '১২ - ২৪ ঘণ্টা', rate: '৳৬০ (সিটি) / ৳১৩০ (বাহিরে)' },
                    { name: 'Pathao Delivery', desc: 'অত্যাধুনিক লাইভ জিপিএস ট্র্যাকিং ও দ্রুত পেমেন্ট ডিসবার্সমেন্ট সিস্টেম।', img: 'https://images.unsplash.com/photo-1566576912321-d58ded7a2144?auto=format&fit=crop&q=80&w=300', speed: '২৪ - ৪৮ ঘণ্টা', rate: '৳৬৫ (সিটি) / ৳১২৫ (বাহিরে)' },
                    { name: 'RedX Delivery', desc: 'শক্তিশালী লজিস্টিকস কাভারেজ নেটওয়ার্ক ও কাস্টমার ফ্রেন্ডলি এপিআই ইন্টারেকশন।', img: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=300', speed: '২৮ - ৪৮ ঘণ্টা', rate: '৳৬০ (সিটি) / ৳১২০ (বাহিরে)' }
                  ].map((c, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-base text-white">{c.name}</h3>
                        <span className="bg-green-500/15 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/10">API Linked</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
                      
                      <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs text-zinc-500">
                        <p>ডেলিভারি দ্রুততা: <span className="text-zinc-200 font-bold">{c.speed}</span></p>
                        <p>সার্ভিস রেট: <span className="text-zinc-200 font-bold">{c.rate}</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier active tracking list logs */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-white">চলমান কুরিয়ার বুকিং সমূহ (Active Courier Dispatches)</h3>
                      <p className="text-xs text-zinc-500">যে সকল পার্সেল ইতিমধ্যে কুরিয়ার এপিআই এর মাধ্যমে বুকিং করা হয়েছে।</p>
                    </div>
                    <button
                      onClick={() => setCourierSubTab('settings')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      নতুন এপিআই কি সেট করুন →
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                          <th className="py-3 px-2">অর্ডার আইডি</th>
                          <th className="py-3 px-2">কুরিয়ার পার্টনার</th>
                          <th className="py-3 px-2">কুরিয়ার আইডি (Ref)</th>
                          <th className="py-3 px-2">ট্র্যাকিং নাম্বার</th>
                          <th className="py-3 px-2">ডেলিভারি ঠিকানা ও জেলা</th>
                          <th className="py-3 px-2">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.courierName).map(o => (
                          <tr key={o.id} className="border-b border-zinc-800/40 text-zinc-300">
                            <td className="py-3.5 px-2 font-mono font-bold text-teal-400">{o.id}</td>
                            <td className="py-3.5 px-2">
                              <span className="font-bold text-white block">{o.courierName}</span>
                            </td>
                            <td className="py-3.5 px-2 font-mono text-zinc-500">{o.courierId}</td>
                            <td className="py-3.5 px-2 font-mono font-bold text-amber-400">{o.trackingNumber}</td>
                            <td className="py-3.5 px-2 text-xs">{o.address}, {o.district}</td>
                            <td className="py-3.5 px-2">
                              <button 
                                onClick={() => {
                                  alert(`প্রিন্ট হচ্ছে শিপিং লেবেল:\n\n=========================\n${o.courierName} Delivery Label\n=========================\nTRK ID: ${o.trackingNumber}\nRecipient: ${o.customerName}\nPhone: ${o.phone}\nAddress: ${o.address}, ${o.district}\nValue collect: ৳${o.paymentStatus === 'Paid' ? 0 : o.totalAmount}\n=========================`);
                                }}
                                className="bg-zinc-800 hover:bg-zinc-700 font-semibold p-1.5 rounded text-[10px] text-zinc-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-teal-400" /> প্রিন্ট লেবেল
                              </button>
                            </td>
                          </tr>
                        ))}
                        {orders.filter(o => o.courierName).length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-xs text-zinc-500">কোনো পার্সেল কুরিয়ার বুকিং করা হয়নি।</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Category Management System */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Grid3X3 className="w-6 h-6 text-teal-400" /> ক্যাটাগরি ম্যানেজমেন্ট পোর্টাল
                </h2>
                <p className="text-xs text-zinc-400">স্টোরের পণ্য ক্যাটাগরি সমূহ তৈরি, পরিবর্তন ও সচলতা নিয়ন্ত্রণ করুন</p>
              </div>
              
              {/* Beautiful Add Category Action Button */}
              <button 
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black px-5 py-3 rounded-xl cursor-pointer transition flex items-center gap-2 shadow-lg shadow-teal-500/10 scale-100 hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি যোগ করুন (ছবিসহ)
              </button>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
              {allCategories.map(cat => {
                const catProducts = products.filter(p => p.category === cat.name);
                const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
                const avgPrice = catProducts.length > 0 
                  ? Math.round(catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length) 
                  : 0;

                return (
                  <div key={cat.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-8 -mt-8 transition group-hover:bg-teal-500/10"></div>
                    
                    <div className="flex justify-between items-start gap-2 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-110" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&auto=format&fit=crop&q=60';
                              }}
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <Grid3X3 className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-md uppercase font-mono">ক্যাটাগরি</span>
                          <h4 className="font-extrabold text-base text-white mt-1 group-hover:text-teal-300 transition max-w-[150px] truncate">{cat.name}</h4>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition">
                        <button 
                          onClick={() => {
                            setCategoryToEdit(cat.name);
                            setIsEditCategoryModalOpen(true);
                          }}
                          title="নাম ও ছবি সংশোধন"
                          className="p-1 px-1.5 bg-zinc-800 hover:bg-teal-600 text-zinc-300 hover:text-white rounded-lg transition text-xs flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <FolderEdit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setCategoryToDelete(cat.name);
                            setIsDeleteCategoryModalOpen(true);
                          }}
                          title="মুছে ফেলুন"
                          className="p-1 px-1.5 bg-zinc-800 hover:bg-rose-600/80 text-zinc-300 hover:text-white rounded-lg transition text-xs flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 font-mono relative z-10">
                      <div className="text-center rounded-lg bg-zinc-950 p-2 border border-zinc-800/30">
                        <span className="text-[10px] text-zinc-500 block uppercase font-sans">পণ্য সংখ্যা</span>
                        <span className="text-xs sm:text-sm font-bold text-teal-400">{catProducts.length} টি</span>
                      </div>
                      <div className="text-center rounded-lg bg-zinc-950 p-2 border border-zinc-800/30">
                        <span className="text-[10px] text-zinc-500 block uppercase font-sans">মোট স্টক</span>
                        <span className="text-xs sm:text-sm font-bold text-amber-400">{totalStock} পিস</span>
                      </div>
                      <div className="text-center rounded-lg bg-zinc-950 p-2 border border-zinc-800/30">
                        <span className="text-[10px] text-zinc-500 block uppercase font-sans">গড় মূল্য</span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-400">৳{avgPrice}</span>
                      </div>
                    </div>

                    {/* Quick View Products in Category */}
                    {catProducts.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide block font-sans">ক্যাটাগরিভুক্ত প্রধান পণ্যসমূহ:</span>
                        <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-zinc-400 pr-1.5 font-sans">
                          {catProducts.slice(0, 3).map(p => (
                            <div key={p.id} className="flex justify-between items-center bg-zinc-950/40 p-1.5 rounded border border-zinc-800/60">
                              <span className="truncate max-w-[140px] text-zinc-300 font-medium">{p.banglaName || p.name}</span>
                              <span className="text-teal-400 font-mono font-bold shrink-0">৳{p.price}</span>
                            </div>
                          ))}
                          {catProducts.length > 3 && (
                            <span className="text-[10px] text-zinc-500 italic block mt-1">এবং আরও {catProducts.length - 3}টি পণ্য তালিকাভুক্ত রয়েছে।</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-zinc-950/30 rounded-xl border border-zinc-800/30">
                        <span className="text-[10px] text-zinc-500 italic">এই ক্যাটাগরিতে কোনো প্রোডাক্ট যুক্ত করা হয়নি।</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic HRM System Tab View */}
        {activeTab === 'hrm' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-white">HRM (Human Resource Management) সিস্টেম</h2>
                <p className="text-xs text-zinc-400">কর্মীদের ডাটাবেস, রিয়েল-টাইম উপস্থিতি এবং বেতন সীট ইন্টিগ্রেশন</p>
              </div>
              <button 
                onClick={() => setShowAddEmployeeModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> নতুন কর্মী যুক্ত করুন
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                    <th className="py-3 px-3">কর্মী আইডি</th>
                    <th className="py-3 px-3">নাম ও পদবী</th>
                    <th className="py-3 px-3">ইমেইল ও ফোন</th>
                    <th className="py-3 px-3">মৌলিক বেতন (Salary)</th>
                    <th className="py-3 px-3">উপস্থিতি হার (Score)</th>
                    <th className="py-3 px-3">অবস্থা (Status)</th>
                    <th className="py-3 px-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b border-zinc-800/40 text-zinc-300">
                      <td className="py-4 px-3 font-mono text-zinc-500">{emp.id}</td>
                      <td className="py-4 px-3">
                        <div>
                          <span className="font-bold text-white block">{emp.name}</span>
                          <span className="text-[10px] text-teal-400 block font-semibold">{emp.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-0.5 text-xs font-mono">
                          <p>{emp.email}</p>
                          <p className="text-zinc-400">{emp.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-white">৳{emp.salary}</td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${emp.attendanceRate}%` }}></div>
                          </div>
                          <span className="font-mono text-xs font-bold text-white">{emp.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => toggleEmployeeStatus(emp.id)}
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer hover:opacity-85 ${
                            emp.status === 'Active' ? 'bg-green-500/10 text-green-400' 
                            : emp.status === 'On Leave' ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {emp.status} Tgl
                        </button>
                      </td>
                      <td className="py-4 px-3">
                        <button 
                          onClick={() => setSalaryCalculatorEmployee(emp)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-xs py-1.5 px-3 border border-zinc-700 rounded-lg transition text-zinc-300"
                        >
                          ৳ পে-স্লিপ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Landing Page Generator and customize settings tab */}
        {activeTab === 'landing' && (
          <div className="animate-fadeIn">
            <LandingPageManager
              products={products}
              landingPages={landingPages}
              setLandingPages={setLandingPages}
              setActiveLandingId={setActiveLandingId}
              triggerSystemNotification={triggerSystemNotification}
            />
          </div>
        )}

        {/* Dynamic Role permissions configurations screen */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-black text-white">রোল ও পারমিশন ম্যানেজমেন্ট (RBAC)</h2>
              <p className="text-xs text-zinc-400">একাধিক ব্যবহারকারীদের জন্য ডেটা এক্সেস কন্ট্রোল পলিসি</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { r: 'Super Admin', desc: 'প্রতিষ্ঠাতার রোল। ইনভেন্টরি, ডোমেইন, কর্মী বেতন, ট্র্যাকিং আইডি এবং অর্থ-সম্পর্কিত সমস্ত ফাইলের অ্যাক্সেস পান।', status: 'সম্পূর্ণ উন্মুক্ত', bgBorder: 'border-teal-500/80 bg-teal-500/5' },
                { r: 'Store Manager', desc: 'ব্যবস্থাপক রোল। অর্ডার প্রসেস, প্রোডাক্ট এডিট, কুরিয়ার ও এসএমএস প্যানেল এক্সেস পাবেন। শুধুমাত্র মূল ইন্টিগ্রেশন সেটিংসে অ্যাক্সেস ব্লক রয়েছে।', status: 'আংশিক কড়া', bgBorder: 'border-blue-500/40 bg-zinc-900' },
                { r: 'Sales Staff', desc: 'কাউন্টার বুকিং কর্মী। শুধুমাত্র পিওএস (POS) কার্ট ডেক্স এবং ক্রেতাদের অর্ডার কুরিয়ার সার্ভিসিং দেখতে ও এডিট করতে পারবেন। রিপোর্টিং পেজ লকড।', status: 'কড়া নিয়ন্ত্রিত', bgBorder: 'border-amber-500/40 bg-zinc-900' }
              ].map((roleDef, idx) => (
                <div key={idx} className={`border p-6 rounded-2xl space-y-4 ${roleDef.bgBorder}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-base">{roleDef.r}</span>
                    <span className="bg-zinc-800 text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{roleDef.status}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{roleDef.desc}</p>
                  
                  <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>POS অ্যাক্সেস:</span>
                      <span className="text-green-500 font-bold">অনুমোদিত ✔</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>HRM এবং অর্থ বেতন:</span>
                      <span className={roleDef.r === 'Super Admin' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {roleDef.r === 'Super Admin' ? 'অনুমোদিত ✔' : 'অফলাইন ❌'}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Pixel ইন্টিগ্রেশন:</span>
                      <span className={roleDef.r !== 'Sales Staff' && roleDef.r !== 'Store Manager' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {roleDef.r === 'Super Admin' ? 'অনুমোদিত ✔' : 'অফলাইন ❌'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Settings and pixel trackers Integrations Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Tracking integration config */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-white">ট্র্যাকিং সাপোর্ট ও ইন্টিগ্রেশন সলিউশন</h3>
                  <p className="text-zinc-400 text-xs">গ্রাহকের পিক্সেল ইভেন্ট কন্ট্রোলার ও Google Tag Manager setup</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold block">Facebook Pixel / Dataset ID</label>
                    <input 
                      type="text" 
                      value={fbPixelId}
                      onChange={(e) => setFbPixelId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                    />
                    <span className="text-[10px] text-zinc-500 block">স্মার্ট পিক্সেল ‘Pageview’ ও ‘PurchaseComplete’ ইভেন্ট অটো-ফায়ার হবে।</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold block">Google Tag Manager (GTM) Container ID</label>
                    <input 
                      type="text" 
                      value={gtmId}
                      onChange={(e) => setGtmId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-white"
                    />
                    <span className="text-[10px] text-zinc-500 block">GTM স্ক্রিপ্ট হেডার ও গুগল এনালিটিক্স ইভেন্ট ট্র্যাকিং সক্রিয়।</span>
                  </div>

                  <button 
                    onClick={handleSaveTracking}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                  >
                    ইন্টিগ্রেশন আইডি সেভ করুন
                  </button>

                  <AnimatePresence>
                    {isSavedTracking && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-green-400 font-bold"
                      >
                        ✔ সফলভাবে পিক্সেল ডাটাবেস সেভ ও সিংক করা হয়েছে!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Simulated Server tracking log payload events triggered when checkouts happen */}
              <div className="bg-zinc-900 border border-zinc-805 rounded-2xl p-6 space-y-4">
                <h3 className="font-extrabold text-base text-white">লাইভ পিক্সেল সার্ভার-সাইড ইভেন্ট স্ট্রিম</h3>
                <p className="text-zinc-400 text-xs">আপনার পেজে অর্ডার নিশ্চিত করার সাথে সাথে ট্রিগারকৃত ডেমো ইভেন্ট লগ</p>
                
                <div className="bg-zinc-950 p-4 rounded-xl font-mono text-[10px] text-teal-400 h-64 overflow-y-auto space-y-2">
                  <p className="text-zinc-500">// Waiting for checkouts in Sandbox...</p>
                  <p className="text-zinc-400">⚡ [Server API GTM] Initialized container: {gtmId}</p>
                  <p className="text-zinc-400">⚡ [Facebook SDK Pixel] Track: PageView successfully fired.</p>
                  {orders.map((ord, idx) => (
                    <p key={idx} className="text-green-400">
                      ✔ [FB-EVENT-PURCHASE] {ord.id} - Customer checkout logged: {ord.customerName} (৳{ord.totalAmount}) - Pixel {fbPixelId}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Banner & SEO Editors section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AdminBannerPanel triggerSystemNotification={triggerSystemNotification} />
              <AdminSEOPanel triggerSystemNotification={triggerSystemNotification} />
            </div>
          </div>
        )}

        </div>
      </main>

      {/* Add Product Modal Drawer inside reports */}
      <ProductAddModal 
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        products={products}
        setProducts={setProducts}
        triggerSystemNotification={triggerSystemNotification}
        categories={categoryNames}
      />

      {/* Edit Product Modal */}
      <ProductEditModal 
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        setProducts={setProducts}
        triggerSystemNotification={triggerSystemNotification}
        categories={categoryNames}
      />

      {/* Category Add Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        allCategories={categoryNames}
        onAdd={handleAddCategory}
      />

      {/* Category Edit Modal */}
      <EditCategoryModal 
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        categoryImage={allCategories.find(c => c.name === categoryToEdit)?.image || ''}
        allCategories={categoryNames}
        onRename={handleRenameCategory}
      />

      {/* Category Delete Modal */}
      <DeleteCategoryModal 
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        categoryToDelete={categoryToDelete}
        products={products}
        allCategories={categoryNames}
        onDelete={handleDeleteCategory}
      />

      {/* Add Employee HRM Roster Modal Drawer */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 space-y-6 relative"
            >
              <button 
                onClick={() => setShowAddEmployeeModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-extrabold text-white">নতুন কর্মী নিয়োগ বিবরণী</h3>

              <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">কর্মীর পূর্ণ নাম *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="যেমন: মোঃ জাহিদ হাসান"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">মোবাইল নাম্বার *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="১১ ডিজিট"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    maxLength={11}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 block font-bold">কর্মী পদবী / দায়িত্ব *</label>
                    <select
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-teal-400 p-2.5 rounded-lg focus:outline-none font-bold"
                    >
                      <option value="স্টোর ম্যানেজার">স্টোর ম্যানেজার</option>
                      <option value="কাস্টমার সাপোর্ট এক্সিকিউটিভ">কাস্টমার সাপোর্ট এক্সিকিউটিভ</option>
                      <option value="ডেলিভারি অ্যাসিস্ট্যান্ট">ডেলিভারি অ্যাসিস্ট্যান্ট</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 block font-bold">মৌলিক বেতন (মাসিক) *</label>
                    <input 
                      type="number" 
                      required
                      value={newEmpSalary}
                      onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                >
                  স্টাফ হিসেবে রেজিস্টার করুন
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HRM Calculator Salary Payslip Slip Modal */}
      <AnimatePresence>
        {salaryCalculatorEmployee && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-zinc-900 w-full max-w-sm rounded-2xl p-6 space-y-6 relative shadow-2xl"
            >
              <button 
                onClick={() => setSalaryCalculatorEmployee(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-950"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-2 border-b">
                <Building2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-extrabold text-base">FeelZone Fashion HRM অ্যাকাউন্ট পে-স্লিপ</h3>
                <p className="text-[10px] text-zinc-500 font-mono">মাসিক রিয়েল-টাইম ডিসবার্সমেন্ট সিট</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">কর্মী নাম:</span>
                  <span className="font-bold text-zinc-800">{salaryCalculatorEmployee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">পদবী (Role):</span>
                  <span className="font-bold text-teal-800">{salaryCalculatorEmployee.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">বেতন স্লট:</span>
                  <span className="font-bold text-zinc-800 font-mono">৳{salaryCalculatorEmployee.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">উপস্থিতি হার:</span>
                  <span className="font-mono font-bold text-zinc-800">{salaryCalculatorEmployee.attendanceRate}%</span>
                </div>

                {/* Deduct calculation based on attendance */}
                {salaryCalculatorEmployee.attendanceRate < 95 && (
                  <div className="flex justify-between text-red-600">
                    <span>অনুপস্থিতি জরিমানা (Deduction):</span>
                    <span className="font-mono font-bold">-৳{Math.round(salaryCalculatorEmployee.salary * 0.05)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-extrabold text-teal-950 border-t pt-2.5">
                  <span>চূড়ান্ত প্রদেয় বেতন (Net Pay):</span>
                  <span className="font-mono">৳{
                    salaryCalculatorEmployee.attendanceRate >= 95 
                      ? salaryCalculatorEmployee.salary 
                      : Math.round(salaryCalculatorEmployee.salary * 0.95)
                  }</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert(`কর্মী ${salaryCalculatorEmployee.name} এর বেতন স্লিপ ব্যাংক অ্যাকাউন্টে ট্রান্সফার করা হয়েছে।`);
                  setSalaryCalculatorEmployee(null);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition"
              >
                বেতন পরিশোধ ও লগ আপডেট করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Courier carrier Booking Provider selector dropdown modal */}
      <AnimatePresence>
        {bookingOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-sm rounded-2xl p-6 space-y-6 relative shadow-2xl"
            >
              <button 
                onClick={() => setBookingOrder(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base">শিপমেন্ট লজিস্টিকস বুকিং এপিআই</h3>
                <p className="text-zinc-400 text-xs">অর্ডার: <span className="font-mono text-teal-400 font-bold">{bookingOrder.id}</span></p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-950 rounded-xl space-y-1.5 text-zinc-400 border border-zinc-850">
                  <p>গ্রাহক: <span className="text-white font-bold">{bookingOrder.customerName}</span></p>
                  <p>ঠিকানা: <span className="text-white font-bold">{bookingOrder.address}, {bookingOrder.district}</span></p>
                  <p>বিল কালেক্ট: <span className="text-white font-bold">৳{bookingOrder.paymentStatus === 'Paid' ? 0 : bookingOrder.totalAmount} (COD)</span></p>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">কুরিয়ার কোম্পানি নির্বাচন করুন *</label>
                  <select
                    value={courierProvider}
                    onChange={(e) => setCourierProvider(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-teal-400 p-2.5 rounded-lg focus:outline-none font-bold"
                  >
                    <option value="Steadfast">Steadfast Courier (স্টেডফাস্ট)</option>
                    <option value="Pathao">Pathao Delivery (পাঠাও)</option>
                    <option value="RedX">RedX Delivery (রেডএক্স)</option>
                  </select>
                </div>

                <button 
                  onClick={handleCourierBooking}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl transition cursor-pointer"
                >
                  কুরিয়ারে বুক করুন (Confirm API Call)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Thermal POS Receipt print preview modal */}
      <AnimatePresence>
        {showThermalReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-zinc-950 w-full max-w-sm rounded-xl p-5 space-y-6 relative shadow-2xl font-mono text-xs"
            >
              <button 
                onClick={() => setShowThermalReceipt(null)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 border rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <h3 className="font-black text-sm uppercase">FeelZone Fashion - থার্মাল পিওএস রিসিট</h3>
                <p className="text-[10px] text-zinc-500">Dhanmondi Outlet, Dhaka</p>
                <p className="text-[10px] text-zinc-500 font-mono">Date: {new Date(showThermalReceipt.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="space-y-1.5 border-t border-b border-dashed py-3 my-3">
                <p>ORDER ID: {showThermalReceipt.id}</p>
                <p>CUSTOMER: {showThermalReceipt.customerName}</p>
                <p>PHONE: {showThermalReceipt.phone}</p>
                <p>DISTRICT: {showThermalReceipt.district}</p>
              </div>

              <div className="space-y-1 font-bold">
                <p className="border-b pb-1 mb-1 text-[10px] text-zinc-400">ITEMS SELECTED</p>
                {showThermalReceipt.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[150px]">{it.product.banglaName || it.product.name}</span>
                    <span>{it.quantity} x ৳{it.product.price} = ৳{it.quantity * it.product.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed pt-3 text-xs space-y-1">
                <div className="flex justify-between font-black">
                  <span>NET PAYABLE SUM:</span>
                  <span>৳{showThermalReceipt.totalAmount}</span>
                </div>
                <p className="text-[9px] text-zinc-400 pt-1 italic text-center">** Paid via Counter Counter **</p>
                <p className="text-[9px] text-zinc-400 text-center">Thank you for shopping at FeelZone Fashion!</p>
              </div>

              <button 
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2 rounded text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> প্রিন্ট লেআউট
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
