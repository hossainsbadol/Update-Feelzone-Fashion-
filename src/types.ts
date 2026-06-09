export interface Product {
  id: string;
  name: string;
  banglaName?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  sku: string;
  description: string;
  ratings: number;
  reviewsCount: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery' | 'Card';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  status: OrderStatus;
  createdAt: string;
  courierId?: string;
  courierName?: 'Steadfast' | 'Pathao' | 'RedX';
  trackingNumber?: string;
  fraudRiskScore: number; // 0 (Safe) to 100 (Dangerous)
  fraudReasons: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  attendanceRate: number;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

export interface SMSLog {
  id: string;
  recipient: string;
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  timestamp: string;
  type: 'Order Confirmation' | 'Delivery Alert' | 'Promo' | 'Custom';
}

export type LandingPageTheme = 'Warm Amber' | 'Deep Emerald' | 'Cosmic Blue' | 'Sleek Charcoal' | 'Bold Red';

export interface LandingPage {
  id: string;
  productId: string;
  theme: LandingPageTheme;
  title: string;
  headline: string;
  subheadline: string;
  badgeText: string;
  videoUrl?: string;
  guaranteeText: string;
  accentColor: string;
}

export type UserRole = 'Super Admin' | 'Store Manager' | 'Sales Staff';

export interface Category {
  name: string;
  image?: string;
}

export interface RolePermissions {
  viewAnalytics: boolean;
  manageHRM: boolean;
  managePOS: boolean;
  editProducts: boolean;
  manageOrders: boolean;
}
