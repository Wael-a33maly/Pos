// ============================================
// Products Types - أنواع المنتجات
// ============================================

import type { Product as GlobalProduct, ProductVariant as GlobalProductVariant, ProductVariation as GlobalProductVariation, Category, Brand, Supplier } from '@/types';

// Re-export global types
export type { Category, Brand, Supplier };

// Extended Product type for module
export interface Product extends GlobalProduct {
  variants?: ProductVariant[];
  variations?: ProductVariation[];
}

export interface ProductVariant extends GlobalProductVariant {
  id: string;
  productId: string;
  name: string;
  nameAr?: string;
  sku?: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  attributes?: string;
}

// النظام الجديد - متغيرات الأسعار
export interface ProductVariation extends GlobalProductVariation {
  id: string;
  productId: string;
  price: number;
  name?: string;
  barcode: string;
  stock: number;
  isStockTracked: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Form Data Types
export interface ProductFormData {
  barcode: string;
  sku: string;
  name: string;
  nameAr: string;
  description: string;
  categoryId: string;
  brandId: string;
  supplierId: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  minStock: number;
  maxStock: number;
  unit: string;
  hasVariants: boolean;
  isStockTracked: boolean;  // هل المنتج مخزني
  isActive: boolean;
}

// النظام القديم للمتغيرات
export interface VariantFormData {
  name: string;
  nameAr: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  attributes: string;
}

// النظام الجديد - نموذج متغير السعر
export interface VariationFormData {
  id?: string;
  price: number;
  name?: string;
  barcode: string;
  stock: number;
  isStockTracked: boolean;
}

// API Response Types
export interface ProductsApiResponse {
  products: Product[];
}

export interface CategoriesApiResponse {
  categories: Category[];
}

export interface BrandsApiResponse {
  brands: Brand[];
}

export interface SuppliersApiResponse {
  suppliers: Supplier[];
}

// Component Props
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay?: number;
}

// State Types
export interface ProductsState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
}
