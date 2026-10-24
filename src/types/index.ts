export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'in_transit'
  | 'unloading'
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
  basePrice?: number;
  unit?: string;
  gstRate?: number;
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

export interface IAuditLog {
  _id: string;
  action: string;
  actorType: 'admin' | 'user' | 'system' | 'gateway';
  actorId: string;
  actorName?: string;
  targetType: string;
  targetId: string;
  details?: {
    materialName?: string;
    oldPrice?: number;
    newPrice?: number;
    priceChanged?: boolean;
    modifiedFields?: string[];
    orderNumber?: string;
    oldStatus?: string;
    newStatus?: string;
    vehicleNumber?: string;
    partnerName?: string;
    partnerRole?: string;
    note?: string;
    [key: string]: unknown;
  };
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export type PartnerSpecialty =
  | 'RCC Masonry'
  | 'Electrical'
  | 'Plumbing'
  | 'Driver'
  | 'Excavator Operator'
  | 'Structural Fabrication';

export type KycStatus = 'approved' | 'pending' | 'rejected';

export interface IPartner {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  specialty: PartnerSpecialty;
  role: 'technician' | 'driver';
  kycStatus: KycStatus;
  aadhaarNumber?: string;
  licenseNumber?: string;
  vehicleNumber?: string;
  rating: number;
  completedJobs: number;
  city: string;
  joinedAt: string;
  bankVerified?: boolean;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: unknown;
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
export const IAuditLog = {};
export const IPartner = {};
export const IApiResponse = {};
export const IHealthResponse = {};
