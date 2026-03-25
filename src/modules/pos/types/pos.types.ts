// ============================================
// POS Types - أنواع نقطة البيع
// ============================================

import type { Product, Customer } from '@/types';

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  totalAmount: number;
  product?: Product;
}

export interface CartState {
  items: CartItem[];
  customer: Customer | null;
  discountAmount: number;
  notes: string;
}

// Payment Types
export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'mixed';

export interface PaymentInfo {
  methodId: string;
  methodName: string;
  amount: number;
  reference?: string;
}

export interface PaymentState {
  payments: PaymentInfo[];
  totalPaid: number;
  change: number;
}

// Invoice Types
export interface InvoicePreview {
  invoiceNumber: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  change: number;
  paymentMethod: PaymentMethodType;
  customer?: Customer;
}

// POS Settings
export interface POSSettings {
  showProductImages: boolean;
  gridColumns: number;
  quickQuantity: number[];
  defaultPaymentMethod: string;
  autoPrint: boolean;
  soundEnabled: boolean;
}

// POS State
export interface POSState {
  cart: CartState;
  payment: PaymentState;
  settings: POSSettings;
  isLoading: boolean;
  error: string | null;
}
