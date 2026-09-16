export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'refunded';

export interface ISiteAddress {
  siteName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface IOrderItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  gstAmount: number;
  hsnCode?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  gstin?: string;
  siteAddress: ISiteAddress;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  unloadingCharges: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  eWayBillNo?: string;
  deliveryOtp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMaterial {
  _id: string;
  id: string;
  name: string;
  category: string;
  categoryId: string;
  subCategory?: string;
  subCategoriesCount?: number;
  subCategoriesList?: string[];
  subtitle?: string;
  brand?: string;
  grade?: string;
  defaultPrice: number;
  basePrice?: number;
  unit: string;
  hsnCode?: string;
  gstRate: number;
  inStock: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  image?: string;
  tag?: string;
  originYard?: string;
  description?: string;
}

export interface ICategory {
  id: string;
  name: string;
  image?: string;
  count: string;
  priceLabel: string;
  subcategoriesText: string;
  tag?: string;
  description?: string;
}

export interface IService {
  _id: string;
  id: string;
  name: string;
  subtitle: string;
  rate: string;
  description: string;
  image?: string;
  tag: string;
  active?: boolean;
}

export interface ICustomer {
  _id: string;
  name: string;
  phone: string;
  companyName: string;
  gstin?: string;
  email?: string;
  totalOrders: number;
  totalSpend: number;
  primarySite: string;
  city: string;
  status: 'active' | 'inactive';
}

export interface IAdminUser {
  name: string;
  phone: string;
  role: 'admin' | 'super_admin';
  creditLimit?: number;
  email?: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: any;
}

// Runtime companion exports to satisfy bundler treeshaking
export const OrderStatus = {};
export const PaymentStatus = {};
export const ISiteAddress = {};
export const IOrderItem = {};
export const IOrder = {};
export const IMaterial = {};
export const ICategory = {};
export const IService = {};
export const ICustomer = {};
export const IAdminUser = {};
export const IApiResponse = {};
export const IHealthResponse = {};
