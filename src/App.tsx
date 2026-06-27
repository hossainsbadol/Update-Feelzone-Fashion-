import React, { useState, useEffect } from 'react';
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
import { Product, Order, Employee, SMSLog, LandingPage, UserRole, Category, Customer } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, onSnapshot } from 'firebase/firestore';

const getCachedData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export default function App() {
  // Sync Data States (Local state managed via real-time Firebase listeners - prefilled with static data / cached localStorage for instant load on slow connections)
  const [products, setProductsState] = useState<Product[]>(() => getCachedData('cached_products', INITIAL_PRODUCTS));
  const [orders, setOrdersState] = useState<Order[]>(() => getCachedData('cached_orders', INITIAL_ORDERS));
  const [employees, setEmployeesState] = useState<Employee[]>(() => getCachedData('cached_employees', INITIAL_EMPLOYEES));
  const [customers, setCustomersState] = useState<Customer[]>(() => getCachedData('cached_customers', []));
  
  // Real-time up-to-date refs to bypass stale React state closures in handlers and async synchronizers
  const latestProductsRef = React.useRef<Product[]>(products);
  const latestOrdersRef = React.useRef<Order[]>(orders);
  const latestEmployeesRef = React.useRef<Employee[]>(employees);
  const latestCustomersRef = React.useRef<Customer[]>(customers);
  
  const [smsLogs, setSmsLogsState] = useState<SMSLog[]>(() => getCachedData('cached_sms_logs', []));
  
  const [landingPages, setLandingPagesState] = useState<LandingPage[]>(() => getCachedData('cached_landing_pages', INITIAL_LANDING_PAGES));
  
  // Dynamic empty/custom categories defined globally
  const [emptyCategories, setEmptyCategoriesState] = useState<Category[]>(() => getCachedData('cached_categories', []));

  // Determine if we have real data cached already to skip showing the loading screen
  const hasCachedData = typeof window !== 'undefined' && !!localStorage.getItem('cached_products');

  // Tracks if initial real-time payloads have resolved from firestore database
  const [productsLoaded, setProductsLoaded] = useState(hasCachedData);
  const [ordersLoaded, setOrdersLoaded] = useState(hasCachedData);
  const [employeesLoaded, setEmployeesLoaded] = useState(hasCachedData);
  const [landingPagesLoaded, setLandingPagesLoaded] = useState(hasCachedData);

  // Fallback timer for slow/cellular networks (e.g., Grameenphone, Robi, Banglalink, Teletalk)
  // If initial snapshots do not resolve in 2 seconds, we automatically bypass the blocking loading screen
  // so customers on mobile data can browse the products immediately.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProductsLoaded(true);
      setOrdersLoaded(true);
      setEmployeesLoaded(true);
      setLandingPagesLoaded(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Database Seeding Logic: If firestore database products collection is empty or contains old template data, seed/migrate everything!
  useEffect(() => {
    const seedDatabaseIfNeeded = async () => {
      // Check localStorage first (instant, synchronous)
      const localSeededVal = localStorage.getItem('feelzone_system_seeded_v1');
      if (localSeededVal === 'true' || localSeededVal === 'seeding') {
        console.log('Database seeding skipped (already completed or seeding in progress locally)');
        return;
      }

      // Mark as seeding instantly to prevent any concurrent/subsequent reloads from duplicate-seeding
      localStorage.setItem('feelzone_system_seeded_v1', 'seeding');

      const timeoutPromise = (ms: number) => new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), ms)
      );

      try {
        const metaSnap = await Promise.race([
          getDoc(doc(db, 'settings', 'system_seeded')),
          timeoutPromise(1500)
        ]);
        const alreadySeeded = metaSnap.exists() && metaSnap.data()?.seeded === true;

        if (alreadySeeded) {
          localStorage.setItem('feelzone_system_seeded_v1', 'true');
          return;
        }

        const prodSnap = await Promise.race([
          getDocs(collection(db, 'products')),
          timeoutPromise(1500)
        ]);
        let needsMigration = false;
        
        if (!prodSnap.empty) {
          prodSnap.forEach(d => {
            const data = d.data();
            // Check if database contains old items not relating to photo frames (e.g. fashion cotton punjabee, chocolate gift box)
            if (data.name?.includes('Chocolate Gift Box') || data.sku?.includes('GFT-CHO-LUX') || data.category === 'ইলেকট্রনিক্স' || data.name?.includes('Punjabee')) {
              needsMigration = true;
            }
          });
        }

        if (prodSnap.empty || needsMigration) {
          triggerSystemNotification('📦 FeelZone Fashion ডাটাবেস আপডেট ও সিংক করা হচ্ছে...');
          
          if (needsMigration) {
            // Drop old collections so we get a clean slate for the brand-new photo frames business!
            const prodDocs = await getDocs(collection(db, 'products'));
            for (const docItem of prodDocs.docs) {
              await deleteDoc(doc(db, 'products', docItem.id));
            }
            const landDocs = await getDocs(collection(db, 'landingPages'));
            for (const docItem of landDocs.docs) {
              await deleteDoc(doc(db, 'landingPages', docItem.id));
            }
            const orderDocs = await getDocs(collection(db, 'orders'));
            for (const docItem of orderDocs.docs) {
              await deleteDoc(doc(db, 'orders', docItem.id));
            }
            const smsDocs = await getDocs(collection(db, 'smsLogs'));
            for (const docItem of smsDocs.docs) {
              await deleteDoc(doc(db, 'smsLogs', docItem.id));
            }
          }

          // Seed Products
          for (const p of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
          
          // Seed Orders
          for (const o of INITIAL_ORDERS) {
            await setDoc(doc(db, 'orders', o.id), o);
          }

          // Seed Employees
          for (const e of INITIAL_EMPLOYEES) {
            await setDoc(doc(db, 'employees', e.id), e);
          }

          // Seed Admin SMS logs
          const defaultSms: SMSLog[] = [
            {
              id: 'SMS-1001',
              recipient: '01712345678',
              message: 'প্রিয় আব্দুর রহমান, FeelZone Fashion এ আপনার অর্জিত অর্ডার নং ORD-1001 সফলভাবে ডেলিভারি করা হয়েছে। ধন্যবাদ!',
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
          ];
          for (const s of defaultSms) {
            await setDoc(doc(db, 'smsLogs', s.id), s);
          }

          // Seed Landing Pages
          for (const l of INITIAL_LANDING_PAGES) {
            await setDoc(doc(db, 'landingPages', l.id), l);
          }

          // Seed empty categories metadata doc
          await setDoc(doc(db, 'settings', 'categories'), { emptyCategories: [] });

          // Seed system_seeded metadata doc
          await setDoc(doc(db, 'settings', 'system_seeded'), { seeded: true });

          triggerSystemNotification('✅ কাস্টমাইজড ফটো ফ্রেম ও গিফট শপ মেটা-ডাটাবেস সফলভাবে প্রস্তুত হয়েছে!');
        }

        // Successfully completed seeding
        localStorage.setItem('feelzone_system_seeded_v1', 'true');
      } catch (error) {
        console.error('Database seeding error:', error);
        // Reset to allow retry on next reload if it didn't complete
        localStorage.removeItem('feelzone_system_seeded_v1');
      }
    };

    seedDatabaseIfNeeded();
  }, []);

  const syncToBackend = async (collectionName: string, id: string, data: any, method: 'POST' | 'DELETE' = 'POST') => {
    try {
      const url = method === 'DELETE' ? `/api/${collectionName}/${id}` : `/api/${collectionName}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (method === 'POST') {
        options.body = JSON.stringify(data);
      }
      await fetch(url, options);
    } catch (err) {
      console.error(`Failed to sync ${collectionName} to Cloud SQL backend:`, err);
    }
  };

  // Hydrate data from Cloud SQL backend REST API on startup (bypasses slow cellular network websocket blocks)
  useEffect(() => {
    const hydrateData = async () => {
      try {
        console.log('🔄 Hydrating data from Cloud SQL backend...');
        
        // Fetch products
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const list = await prodRes.json();
          if (list && list.length > 0) {
            latestProductsRef.current = list;
            setProductsState(list);
            setProductsLoaded(true);
            try { localStorage.setItem('cached_products', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch orders
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const list = await ordRes.json();
          if (list && list.length > 0) {
            latestOrdersRef.current = list;
            setOrdersState(list);
            setOrdersLoaded(true);
            try { localStorage.setItem('cached_orders', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch employees
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const list = await empRes.json();
          if (list && list.length > 0) {
            latestEmployeesRef.current = list;
            setEmployeesState(list);
            setEmployeesLoaded(true);
            try { localStorage.setItem('cached_employees', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch SMS logs
        const smsRes = await fetch('/api/sms-logs');
        if (smsRes.ok) {
          const list = await smsRes.json();
          if (list && list.length > 0) {
            setSmsLogsState(list);
            try { localStorage.setItem('cached_sms_logs', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch landing pages
        const lpRes = await fetch('/api/landing-pages');
        if (lpRes.ok) {
          const list = await lpRes.json();
          if (list && list.length > 0) {
            setLandingPagesState(list);
            setLandingPagesLoaded(true);
            try { localStorage.setItem('cached_landing_pages', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const list = await catRes.json();
          if (list && list.length > 0) {
            setEmptyCategoriesState(list);
            try { localStorage.setItem('cached_categories', JSON.stringify(list)); } catch (e) {}
          }
        }

        // Fetch customers
        const custRes = await fetch('/api/customers');
        if (custRes.ok) {
          const list = await custRes.json();
          if (list && list.length > 0) {
            latestCustomersRef.current = list;
            setCustomersState(list);
            try { localStorage.setItem('cached_customers', JSON.stringify(list)); } catch (e) {}
          }
        }

        console.log('✅ Cloud SQL database hydration completed.');
      } catch (err) {
        console.error('⚠️ Could not hydrate from REST API on startup:', err);
      }
    };

    hydrateData();
  }, []);

  // Real-time listener configuration
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      const list: Product[] = [];
      snap.forEach(d => list.push(d.data() as Product));
      latestProductsRef.current = list;
      setProductsState(list);
      setProductsLoaded(true);
      try {
        localStorage.setItem('cached_products', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'products');
      setProductsLoaded(true);
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const list: Order[] = [];
      snap.forEach(d => list.push(d.data() as Order));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      latestOrdersRef.current = list;
      setOrdersState(list);
      setOrdersLoaded(true);
      try {
        localStorage.setItem('cached_orders', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      setOrdersLoaded(true);
    });

    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      const list: Employee[] = [];
      snap.forEach(d => list.push(d.data() as Employee));
      latestEmployeesRef.current = list;
      setEmployeesState(list);
      setEmployeesLoaded(true);
      try {
        localStorage.setItem('cached_employees', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'employees');
      setEmployeesLoaded(true);
    });

    const unsubSms = onSnapshot(collection(db, 'smsLogs'), (snap) => {
      const list: SMSLog[] = [];
      snap.forEach(d => list.push(d.data() as SMSLog));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSmsLogsState(list);
      try {
        localStorage.setItem('cached_sms_logs', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'smsLogs');
    });

    const unsubLanding = onSnapshot(collection(db, 'landingPages'), (snap) => {
      const list: LandingPage[] = [];
      snap.forEach(d => list.push(d.data() as LandingPage));
      setLandingPagesState(list);
      setLandingPagesLoaded(true);
      try {
        localStorage.setItem('cached_landing_pages', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'landingPages');
      setLandingPagesLoaded(true);
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
      const list: Customer[] = [];
      snap.forEach(d => list.push(d.data() as Customer));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      latestCustomersRef.current = list;
      setCustomersState(list);
      try {
        localStorage.setItem('cached_customers', JSON.stringify(list));
      } catch (e) {}
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'customers');
    });

    const unsubCategories = onSnapshot(doc(db, 'settings', 'categories'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.emptyCategories)) {
          const parsed: Category[] = data.emptyCategories.map((item: any) => {
            if (typeof item === 'string') {
              return { name: item };
            }
            return { name: item.name || '', image: item.image || '' };
          });
          setEmptyCategoriesState(parsed);
          try {
            localStorage.setItem('cached_categories', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/categories');
    });

    const unsubSeo = onSnapshot(doc(db, 'settings', 'seo'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          if (data.title) {
            document.title = data.title;
          }
          if (data.description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', data.description);
          }
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/seo');
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubEmployees();
      unsubSms();
      unsubLanding();
      unsubCategories();
      unsubSeo();
      unsubCustomers();
    };
  }, []);

  // Sync state wrappers back to Firestore and Cloud SQL
  const setProducts = (value: React.SetStateAction<Product[]>) => {
    const currentProducts = latestProductsRef.current;
    const next = typeof value === 'function' ? (value as Function)(currentProducts) : value;
    
    // Update local state and ref synchronously to ensure instant, zero-latency feedback on slow/mobile networks
    latestProductsRef.current = next;
    setProductsState(next);
    
    next.forEach((p) => {
      const prevProd = currentProducts.find(x => x.id === p.id);
      if (!prevProd || JSON.stringify(prevProd) !== JSON.stringify(p)) {
        setDoc(doc(db, 'products', p.id), p).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `products/${p.id}`);
        });
        syncToBackend('products', p.id, p);
      }
    });

    currentProducts.forEach((p) => {
      if (!next.some(x => x.id === p.id)) {
        deleteDoc(doc(db, 'products', p.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `products/${p.id}`);
        });
        syncToBackend('products', p.id, null, 'DELETE');
      }
    });
  };

  const setOrders = (value: React.SetStateAction<Order[]>) => {
    const currentOrders = latestOrdersRef.current;
    const next = typeof value === 'function' ? (value as Function)(currentOrders) : value;
    
    // Update local state and ref synchronously to ensure instant, zero-latency feedback on slow/mobile networks
    latestOrdersRef.current = next;
    setOrdersState(next);
    
    next.forEach((o) => {
      const prevOrder = currentOrders.find(x => x.id === o.id);
      if (!prevOrder || JSON.stringify(prevOrder) !== JSON.stringify(o)) {
        setDoc(doc(db, 'orders', o.id), o).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `orders/${o.id}`);
        });
        syncToBackend('orders', o.id, o);
      }
    });

    currentOrders.forEach((o) => {
      if (!next.some(x => x.id === o.id)) {
        deleteDoc(doc(db, 'orders', o.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `orders/${o.id}`);
        });
        syncToBackend('orders', o.id, null, 'DELETE');
      }
    });
  };

  const setEmployees = (value: React.SetStateAction<Employee[]>) => {
    const currentEmployees = latestEmployeesRef.current;
    const next = typeof value === 'function' ? (value as Function)(currentEmployees) : value;
    
    // Update local state and ref synchronously to ensure instant, zero-latency feedback on slow/mobile networks
    latestEmployeesRef.current = next;
    setEmployeesState(next);
    
    next.forEach((e) => {
      const prevEmp = currentEmployees.find(x => x.id === e.id);
      if (!prevEmp || JSON.stringify(prevEmp) !== JSON.stringify(e)) {
        setDoc(doc(db, 'employees', e.id), e).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `employees/${e.id}`);
        });
        syncToBackend('employees', e.id, e);
      }
    });

    currentEmployees.forEach((e) => {
      if (!next.some(x => x.id === e.id)) {
        deleteDoc(doc(db, 'employees', e.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `employees/${e.id}`);
        });
        syncToBackend('employees', e.id, null, 'DELETE');
      }
    });
  };

  const setSmsLogs = (value: React.SetStateAction<SMSLog[]>) => {
    const next = typeof value === 'function' ? (value as Function)(smsLogs) : value;
    
    // Update local state synchronously to ensure instant, zero-latency feedback on slow/mobile networks
    setSmsLogsState(next);
    
    next.forEach((s) => {
      const prevSms = smsLogs.find(x => x.id === s.id);
      if (!prevSms || JSON.stringify(prevSms) !== JSON.stringify(s)) {
        setDoc(doc(db, 'smsLogs', s.id), s).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `smsLogs/${s.id}`);
        });
        syncToBackend('sms-logs', s.id, s);
      }
    });

    smsLogs.forEach((s) => {
      if (!next.some(x => x.id === s.id)) {
        deleteDoc(doc(db, 'smsLogs', s.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `smsLogs/${s.id}`);
        });
      }
    });
  };

  const setLandingPages = (value: React.SetStateAction<LandingPage[]>) => {
    const next = typeof value === 'function' ? (value as Function)(landingPages) : value;
    
    // Update local state synchronously to ensure instant, zero-latency feedback on slow/mobile networks
    setLandingPagesState(next);
    
    next.forEach((l) => {
      const prevLanding = landingPages.find(x => x.id === l.id);
      if (!prevLanding || JSON.stringify(prevLanding) !== JSON.stringify(l)) {
        setDoc(doc(db, 'landingPages', l.id), l).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `landingPages/${l.id}`);
        });
        syncToBackend('landing-pages', l.id, l);
      }
    });

    landingPages.forEach((l) => {
      if (!next.some(x => x.id === l.id)) {
        deleteDoc(doc(db, 'landingPages', l.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `landingPages/${l.id}`);
        });
        syncToBackend('landing-pages', l.id, null, 'DELETE');
      }
    });
  };

  const setEmptyCategories = (value: React.SetStateAction<Category[]>) => {
    const next = typeof value === 'function' ? (value as Function)(emptyCategories) : value;
    setEmptyCategoriesState(next);
    setDoc(doc(db, 'settings', 'categories'), { emptyCategories: next }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, 'settings/categories');
    });
    // Sync each category back
    next.forEach((c) => {
      syncToBackend('categories', c.name, c);
    });
  };
  
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

    // Subtle Web Audio API chime sound
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        
        const playSubtleChime = (frequency: number, delay: number, duration: number, volume: number) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
          
          // Smooth volume envelope to prevent pop/click and sound highly premium
          gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
          gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
          
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscNode.start(ctx.currentTime + delay);
          oscNode.stop(ctx.currentTime + delay + duration);
        };

        // Dual melodic harmonic chime (Pure E5 and A5 chord pairing)
        playSubtleChime(659.25, 0, 0.4, 0.08); // E5
        playSubtleChime(880.00, 0.08, 0.5, 0.06); // A5
      }
    } catch (err) {
      console.warn("Audio notification suppressed or blocked by browser user interact policy:", err);
    }

    // Auto clear after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleCustomerRegister = (cust: Customer) => {
    // Save to Firebase Database under 'customers' collection
    const data = {
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      createdAt: cust.createdAt,
      lastLoginAt: new Date().toISOString(),
      address: cust.address || '',
      email: cust.email || ''
    };
    setDoc(doc(db, 'customers', cust.phone), data, { merge: true }).catch((err) => {
      console.error("Failed to save customer:", err);
    });
    syncToBackend('customers', cust.phone, data);
  };

  const handleNewOrder = (order: Order) => {
    // Write new order to Firebase!
    setDoc(doc(db, 'orders', order.id), order)
      .then(() => {
        triggerSystemNotification(`🛒 নতুন অর্ডার ORD-${order.id} সফলভাবে ফায়ারবেসে যুক্ত হয়েছে!`);
        // Also register customer on checkout automatically
        handleCustomerRegister({
          id: `CUST-${Date.now()}`,
          name: order.customerName,
          phone: order.phone,
          createdAt: new Date().toISOString(),
          address: order.address,
          email: ''
        });
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
      });
    
    // Sync to Cloud SQL REST API
    syncToBackend('orders', order.id, order);

    // Push automation confirmation message to SMS outbox log immediately in Firebase!
    const smsId = `SMS-${Math.floor(10000 + Math.random() * 90000)}`;
    const autoSms: SMSLog = {
      id: smsId,
      recipient: order.phone,
      message: `প্রিয় ${order.customerName}, FeelZone Fashion এ আপনার কাঙ্ক্ষিত অর্ডারটি গ্রহণ করা হয়েছে। অর্ডার আইডি: ${order.id}। পরিশোধ মূল্য: ৳${order.totalAmount}। ধন্যবাদ!`,
      status: 'Sent',
      timestamp: new Date().toISOString(),
      type: 'Order Confirmation'
    };
    
    setDoc(doc(db, 'smsLogs', smsId), autoSms).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `smsLogs/${smsId}`);
    });
    syncToBackend('sms-logs', smsId, autoSms);
  };

  const isSyncingInitial = !productsLoaded || !ordersLoaded || !employeesLoaded || !landingPagesLoaded;

  if (isSyncingInitial) {
    return (
      <div className="bg-zinc-950 min-h-screen flex flex-col items-center justify-center text-zinc-100 relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)]" />
        <div className="z-10 text-center space-y-6 max-w-sm px-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/15 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-teal-500 animate-spin" />
            <div className="absolute inset-2 bg-zinc-900 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-wide text-zinc-100 uppercase animate-pulse">FeelZone Fashion</h2>
            <p className="text-xs text-zinc-400 font-medium font-sans">রিয়েল-টাইম ডাটা সিঙ্ক হচ্ছে...</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-zinc-900/50 border border-zinc-800/80 px-4 py-1.5 rounded-full mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] text-teal-400 font-mono tracking-wider">SECURE DATABASE CONNECTED</span>
          </div>
          
          <div className="pt-2">
            <button
              onClick={() => {
                setProductsLoaded(true);
                setOrdersLoaded(true);
                setEmployeesLoaded(true);
                setLandingPagesLoaded(true);
              }}
              className="w-full px-5 py-3 bg-teal-500/15 hover:bg-teal-500/25 active:scale-[0.98] text-teal-300 border border-teal-500/30 rounded-2xl text-xs font-extrabold tracking-wide transition cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-sm shadow-teal-500/10"
            >
              🚀 এখনই ব্রাউজ করুন (Skip Loading Menu)
            </button>
            <p className="text-[10px] text-zinc-500 font-bold mt-2 font-sans leading-relaxed">
              * গ্রামীণফোন, রবি, ও বাংলালিংক ধীরগতির সিম বা ওয়াইফাই ডাটার জন্য সরাসরি অফলাইন মোড চালু করুন
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 relative">
      
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
                onCustomerRegister={handleCustomerRegister}
                triggerSystemNotification={triggerSystemNotification}
                activeLandingId={activeLandingId}
                setActiveLandingId={setActiveLandingId}
                emptyCategories={emptyCategories}
                onAdminViewClick={() => setActiveView('admin')}
                orders={orders}
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
                  customers={customers}
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
