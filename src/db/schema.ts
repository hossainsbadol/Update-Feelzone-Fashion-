import { pgTable, text, doublePrecision, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Firebase Authenticated Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  banglaName: text('bangla_name'),
  price: doublePrecision('price').notNull(),
  originalPrice: doublePrecision('original_price'),
  image: text('image').notNull(),
  images: jsonb('images'), // Array of images
  category: text('category').notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku').notNull(),
  description: text('description').notNull(),
  ratings: doublePrecision('ratings').notNull().default(5.0),
  reviewsCount: integer('reviews_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories Table
export const categories = pgTable('categories', {
  name: text('name').primaryKey(),
  image: text('image'),
});

// Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  district: text('district').notNull(),
  items: jsonb('items').notNull(), // Array of { product: Product, quantity: number }
  totalAmount: doublePrecision('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  senderNumber: text('sender_number'),
  transactionId: text('transaction_id'),
  courierId: text('courier_id'),
  courierName: text('courier_name'),
  trackingNumber: text('tracking_number'),
  fraudRiskScore: doublePrecision('fraud_risk_score').notNull().default(0),
  fraudReasons: jsonb('fraud_reasons'), // Array of strings
});

// Employees Table
export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  salary: doublePrecision('salary').notNull(),
  attendanceRate: doublePrecision('attendance_rate').notNull().default(100.0),
  joiningDate: text('joining_date').notNull(),
  status: text('status').notNull().default('Active'),
});

// SMS Logs Table
export const smsLogs = pgTable('sms_logs', {
  id: text('id').primaryKey(),
  recipient: text('recipient').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('Pending'),
  timestamp: text('timestamp').notNull(),
  type: text('type').notNull(),
});

// Landing Pages Table
export const landingPages = pgTable('landing_pages', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  theme: text('theme').notNull(),
  title: text('title').notNull(),
  headline: text('headline').notNull(),
  subheadline: text('subheadline').notNull(),
  badgeText: text('badge_text').notNull(),
  videoUrl: text('video_url'),
  guaranteeText: text('guarantee_text').notNull(),
  accentColor: text('accent_color').notNull(),
});

// Customers Table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
  address: text('address'),
  email: text('email'),
});
