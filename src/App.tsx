import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, ShoppingBag, Bell, Sliders, Laptop, ChevronRight, User, HeartHandshake, ShieldAlert
} from 'lucide-react';
import CustomerStore from './components/CustomerStore';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { 
  INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_EMPLOYEES, INITIAL_LANDING_PAGES 
} from './data';
import { Product, Order, Employee, SMSLog, LandingPage, UserRole } from './types';

export default function App() {
  // Sync Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([
    {
      id: 'SMS-1001',
      recipient: '01712345678',
      message: 'প্রিয় আব্দুর রহমান, Feelzone Fashion এ আপনার অর্জিত অর্ডার নং ORD-1001 সফলভাবে ডেলিভারি করা হয়েছে। ধন্যবাদ!',
      status: 'Sent',
      timestamp: '2026-06-05T10:35:00Z',
      type: 'Order Confirmation'
    },
    {
      id: 'SMS-1002',
      recipient: '01911998877',
      message: 'প্রিয় নুসরাত জাহান, আমরা আপনার অর্ডার ORD-1003 টি নিশ্চিত করেছি। শীঘ্রই পার্সেলটি সাজানো শুরু হবে।',
      status: 'Sent',
      timestamp: '2026-06-06T14:26:00Z',
      type: 'Order Confirmation'
    }
  ]);
  
  const [landingPages, setLandingPages] = useState<LandingPage[]>(INITIAL_LANDING_PAGES);
  
  // Dynamic empty/custom categories defined globally
  const [emptyCategories, setEmptyCategories] = useState<string[]>([]);
  
  // RBAC Roles Switch
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin');

  // Customer Front vs Admin Backend View mode
  const [activeView, setActiveView] = useState<'customer' | 'admin'>('customer');
  const [activeLandingId, setActiveLandingId] = useState<string | null>(null);

  // Admin Login State and Persistency
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('feelzone_admin_logged_in') === 'true';
  });

  const handleAdminLogin = (role: UserRole) => {
    setIsAdminLoggedIn(true);
    setActiveRole(role);
    localStorage.setItem('feelzone_admin_logged_in', 'true');
    localStorage.setItem('feelzone_admin_role', role);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('feelzone_admin_logged_in');
    localStorage.removeItem('feelzone_admin_role');
    triggerSystemNotification('🔒 আপনি অ্যাডমিন বিজনেস সুইট থেকে নিরাপদে লগআউট করেছেন।');
  };

  // Sync role if saved in storage previously
  useEffect(() => {
    const savedRole = localStorage.getItem('feelzone_admin_role');
    if (savedRole && isAdminLoggedIn) {
      setActiveRole(savedRole as UserRole);
    }
  }, [isAdminLoggedIn]);

  // Realtime System Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerSystemNotification = (message: string) => {
    setToastMessage(message);
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);

    // Push automation confirmation message to SMS outbox log immediately!
    const autoSms: SMSLog = {
      id: `SMS-${Math.floor(10000 + Math.random() * 90000)}`,
      recipient: order.phone,
      message: `প্রিয় ${order.customerName}, Feelzone Fashion এ আপনার কাঙ্ক্ষিত অর্ডারটি গ্রহণ করা হয়েছে। অর্ডার আইডি: ${order.id}। পরিশোধ মূল্য: ৳${order.totalAmount}। ধন্যবাদ!`,
      status: 'Sent',
      timestamp: new Date().toISOString(),
      type: 'Order Confirmation'
    };
    setSmsLogs(prev => [autoSms, ...prev]);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 relative">
      
      {/* Top Floating View Toggle Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-3 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-50">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            Feelzone Fashion স্টুডিও ভিউ কন্ট্রোলার:
          </span>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('customer');
              setActiveLandingId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'customer' 
                ? 'bg-teal-500 text-zinc-950 font-bold shadow-md' 
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> কাস্টমার স্টোরফ্রন্ট (গ্রাহক ভিউ)
          </button>
          
          <button
            onClick={() => {
              setActiveView('admin');
              setActiveLandingId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'admin' 
                ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-zinc-950 shadow-md font-bold' 
                : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> এডমিন বিজনেস সুইট (অফিস ভিউ)
          </button>
        </div>

        {/* Highlight notification bar */}
        <div className="hidden lg:flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
          <span className="text-[10px] text-zinc-400 font-mono">
            রিয়েল-টাইম গেটওয়ে ও ট্র্যাকিং ইভেন্ট ট্র্যাকার: <b>সক্রিয়</b>
          </span>
        </div>
      </div>

      {/* Main View Render Router */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeView === 'customer' ? (
            <motion.div 
              key="customer"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CustomerStore 
                products={products}
                landingPages={landingPages}
                onNewOrder={handleNewOrder}
                triggerSystemNotification={triggerSystemNotification}
                activeLandingId={activeLandingId}
                setActiveLandingId={setActiveLandingId}
                emptyCategories={emptyCategories}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {isAdminLoggedIn ? (
                <AdminPanel 
                  products={products}
                  setProducts={setProducts}
                  orders={orders}
                  setOrders={setOrders}
                  employees={employees}
                  setEmployees={setEmployees}
                  smsLogs={smsLogs}
                  setSmsLogs={setSmsLogs}
                  landingPages={landingPages}
                  setLandingPages={setLandingPages}
                  triggerSystemNotification={triggerSystemNotification}
                  activeRole={activeRole}
                  setActiveRole={setActiveRole}
                  setActiveLandingId={setActiveLandingId}
                  emptyCategories={emptyCategories}
                  setEmptyCategories={setEmptyCategories}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <AdminLogin 
                  onLoginSuccess={handleAdminLogin}
                  triggerSystemNotification={triggerSystemNotification}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* High-fidelity Custom Toast Alert / Incoming Order Alerts overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-r from-teal-900 to-zinc-900 border-2 border-teal-500/80 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3.5 font-sans"
            id="system-realtime-toast"
          >
            <div className="bg-teal-500 p-2 text-zinc-950 rounded-xl">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">সিস্টেম নোটিফিকেশন</p>
              <p className="text-[11px] text-zinc-100 font-bold mt-1 leading-relaxed">
                {toastMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
