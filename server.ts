import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { products, orders, employees, smsLogs, landingPages, categories, customers } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_EMPLOYEES, INITIAL_LANDING_PAGES } from './src/data.ts';

// Initialize Firebase Admin for security and verification as mandated
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

if (!getApps().length) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log('🔥 Firebase Admin initialized with Project ID:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('⚠️ Firebase Admin initialization bypassed or failed:', err);
  }
}

async function seedDatabaseIfEmpty() {
  try {
    const prodCount = await db.select().from(products).limit(1);
    if (prodCount.length === 0) {
      console.log('🌱 Seeding Cloud SQL database with initial products...');
      for (const p of INITIAL_PRODUCTS) {
        await db.insert(products).values({
          id: p.id,
          name: p.name,
          banglaName: p.banglaName || null,
          price: p.price,
          originalPrice: p.originalPrice || null,
          image: p.image,
          images: p.images || [],
          category: p.category,
          stock: p.stock,
          sku: p.sku,
          description: p.description,
          ratings: p.ratings,
          reviewsCount: p.reviewsCount,
        }).onConflictDoNothing();
      }
    }

    const orderCount = await db.select().from(orders).limit(1);
    if (orderCount.length === 0) {
      console.log('🌱 Seeding Cloud SQL database with initial orders...');
      for (const o of INITIAL_ORDERS) {
        await db.insert(orders).values({
          id: o.id,
          customerName: o.customerName,
          phone: o.phone,
          address: o.address,
          district: o.district,
          items: o.items,
          totalAmount: o.totalAmount,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          status: o.status,
          createdAt: o.createdAt,
          senderNumber: o.senderNumber || null,
          transactionId: o.transactionId || null,
          courierId: o.courierId || null,
          courierName: o.courierName || null,
          trackingNumber: o.trackingNumber || null,
          fraudRiskScore: o.fraudRiskScore,
          fraudReasons: o.fraudReasons || [],
        }).onConflictDoNothing();
      }
    }

    const empCount = await db.select().from(employees).limit(1);
    if (empCount.length === 0) {
      console.log('🌱 Seeding Cloud SQL database with initial employees...');
      for (const e of INITIAL_EMPLOYEES) {
        await db.insert(employees).values({
          id: e.id,
          name: e.name,
          role: e.role,
          email: e.email,
          phone: e.phone,
          salary: e.salary,
          attendanceRate: e.attendanceRate,
          joiningDate: e.joiningDate,
          status: e.status,
        }).onConflictDoNothing();
      }
    }

    const lpCount = await db.select().from(landingPages).limit(1);
    if (lpCount.length === 0) {
      console.log('🌱 Seeding Cloud SQL database with initial landing pages...');
      for (const l of INITIAL_LANDING_PAGES) {
        await db.insert(landingPages).values({
          id: l.id,
          productId: l.productId,
          theme: l.theme,
          title: l.title,
          headline: l.headline,
          subheadline: l.subheadline,
          badgeText: l.badgeText,
          videoUrl: l.videoUrl || null,
          guaranteeText: l.guaranteeText,
          accentColor: l.accentColor,
        }).onConflictDoNothing();
      }
    }

    const catCount = await db.select().from(categories).limit(1);
    if (catCount.length === 0) {
      console.log('🌱 Seeding Cloud SQL database with initial categories...');
      const uniqueCats = Array.from(new Set(INITIAL_PRODUCTS.map(p => p.category)));
      for (const c of uniqueCats) {
        await db.insert(categories).values({
          name: c,
          image: null,
        }).onConflictDoNothing();
      }
    }

    console.log('✅ Cloud SQL database seed check completed.');
  } catch (err) {
    console.error('❌ Cloud SQL database seeding failed:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Seed database if empty on boot
  await seedDatabaseIfEmpty();

  // API HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // PRODUCTS API
  app.get('/api/products', async (req, res) => {
    try {
      const data = await db.select().from(products);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch products', message: err.message });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const p = req.body;
      const values = {
        id: p.id,
        name: p.name,
        banglaName: p.banglaName || null,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        image: p.image,
        images: p.images || [],
        category: p.category,
        stock: Number(p.stock || 0),
        sku: p.sku || '',
        description: p.description || '',
        ratings: Number(p.ratings || 5.0),
        reviewsCount: Number(p.reviewsCount || 0),
      };

      await db.insert(products)
        .values(values)
        .onConflictDoUpdate({
          target: products.id,
          set: values
        });

      res.json({ success: true, product: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save product', message: err.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(products).where(eq(products.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete product', message: err.message });
    }
  });

  // ORDERS API
  app.get('/api/orders', async (req, res) => {
    try {
      const data = await db.select().from(orders);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch orders', message: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const o = req.body;
      const values = {
        id: o.id,
        customerName: o.customerName,
        phone: o.phone,
        address: o.address,
        district: o.district,
        items: o.items,
        totalAmount: Number(o.totalAmount),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        createdAt: o.createdAt,
        senderNumber: o.senderNumber || null,
        transactionId: o.transactionId || null,
        courierId: o.courierId || null,
        courierName: o.courierName || null,
        trackingNumber: o.trackingNumber || null,
        fraudRiskScore: Number(o.fraudRiskScore || 0),
        fraudReasons: o.fraudReasons || [],
      };

      await db.insert(orders)
        .values(values)
        .onConflictDoUpdate({
          target: orders.id,
          set: values
        });

      res.json({ success: true, order: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save order', message: err.message });
    }
  });

  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(orders).where(eq(orders.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete order', message: err.message });
    }
  });

  // EMPLOYEES API
  app.get('/api/employees', async (req, res) => {
    try {
      const data = await db.select().from(employees);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch employees', message: err.message });
    }
  });

  app.post('/api/employees', async (req, res) => {
    try {
      const e = req.body;
      const values = {
        id: e.id,
        name: e.name,
        role: e.role,
        email: e.email,
        phone: e.phone,
        salary: Number(e.salary),
        attendanceRate: Number(e.attendanceRate || 100.0),
        joiningDate: e.joiningDate,
        status: e.status || 'Active',
      };

      await db.insert(employees)
        .values(values)
        .onConflictDoUpdate({
          target: employees.id,
          set: values
        });

      res.json({ success: true, employee: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save employee', message: err.message });
    }
  });

  app.delete('/api/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(employees).where(eq(employees.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete employee', message: err.message });
    }
  });

  // SMS LOGS API
  app.get('/api/sms-logs', async (req, res) => {
    try {
      const data = await db.select().from(smsLogs);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch SMS logs', message: err.message });
    }
  });

  app.post('/api/sms-logs', async (req, res) => {
    try {
      const s = req.body;
      const values = {
        id: s.id,
        recipient: s.recipient,
        message: s.message,
        status: s.status || 'Pending',
        timestamp: s.timestamp,
        type: s.type,
      };

      await db.insert(smsLogs)
        .values(values)
        .onConflictDoUpdate({
          target: smsLogs.id,
          set: values
        });

      res.json({ success: true, log: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save SMS log', message: err.message });
    }
  });

  // LANDING PAGES API
  app.get('/api/landing-pages', async (req, res) => {
    try {
      const data = await db.select().from(landingPages);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch landing pages', message: err.message });
    }
  });

  app.post('/api/landing-pages', async (req, res) => {
    try {
      const l = req.body;
      const values = {
        id: l.id,
        productId: l.productId,
        theme: l.theme,
        title: l.title,
        headline: l.headline,
        subheadline: l.subheadline,
        badgeText: l.badgeText,
        videoUrl: l.videoUrl || null,
        guaranteeText: l.guaranteeText,
        accentColor: l.accentColor,
      };

      await db.insert(landingPages)
        .values(values)
        .onConflictDoUpdate({
          target: landingPages.id,
          set: values
        });

      res.json({ success: true, page: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save landing page', message: err.message });
    }
  });

  app.delete('/api/landing-pages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(landingPages).where(eq(landingPages.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete landing page', message: err.message });
    }
  });

  // CATEGORIES API
  app.get('/api/categories', async (req, res) => {
    try {
      const data = await db.select().from(categories);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch categories', message: err.message });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const c = req.body;
      const values = {
        name: c.name,
        image: c.image || null,
      };

      await db.insert(categories)
        .values(values)
        .onConflictDoUpdate({
          target: categories.name,
          set: values
        });

      res.json({ success: true, category: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save category', message: err.message });
    }
  });

  // CUSTOMERS API
  app.get('/api/customers', async (req, res) => {
    try {
      const data = await db.select().from(customers);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch customers', message: err.message });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const c = req.body;
      const values = {
        id: c.id || c.phone,
        name: c.name,
        phone: c.phone,
        createdAt: c.createdAt,
        lastLoginAt: c.lastLoginAt || null,
        address: c.address || null,
        email: c.email || null,
      };

      await db.insert(customers)
        .values(values)
        .onConflictDoUpdate({
          target: customers.id,
          set: values
        });

      res.json({ success: true, customer: values });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save customer', message: err.message });
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(customers).where(eq(customers.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete customer', message: err.message });
    }
  });

  // VITE DEVELOPMENT OR PRODUCTION BUILD HANDLER
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
