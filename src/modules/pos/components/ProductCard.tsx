// ============================================
// ProductCard Component - بطاقة المنتج (عرض الشبكة)
// ============================================

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Package, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/store';
import { cn } from '@/lib/utils';
import type { Product, POSSettings } from '../types/pos.types';

interface ProductCardProps {
  product: Product;
  settings: POSSettings;
  currency: { symbol: string } | null;
  onAddToCart: (product: Product) => void;
}

/**
 * مكون بطاقة المنتج - يعرض المنتج في وضع الشبكة
 * يدعم التخصيص الكامل عبر الإعدادات
 */
const ProductCard = memo(function ProductCard({
  product,
  settings,
  currency,
  onAddToCart,
}: ProductCardProps) {
  const hasVariations = product.variations && product.variations.length > 0;
  const variationCount = hasVariations ? product.variations!.length : 0;
  
  // حساب المخزون
  const stock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
  const isLowStock = product.isStockTracked && stock <= (product.minStock || 5);
  const isOutOfStock = product.isStockTracked && stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg relative",
          isOutOfStock && "opacity-60"
        )}
        style={{
          borderWidth: settings.cardBorderWidth,
          borderColor: settings.cardBorderColor,
          borderRadius: settings.cardBorderRadius,
        }}
        onClick={() => !isOutOfStock && onAddToCart(product)}
      >
        {/* شارة المتغيرات */}
        {hasVariations && (
          <div className="absolute -top-2 -left-2 z-10">
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white gap-1">
              <Tag className="h-3 w-3" />
              {variationCount} سعر
            </Badge>
          </div>
        )}

        <CardContent
          className="flex flex-col h-full"
          style={{ padding: settings.cardPadding }}
        >
          {/* صورة المنتج */}
          {settings.showProductImage && (
            <>
              <div
                className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden relative"
                style={{ borderRadius: settings.cardBorderRadius - 2 }}
              >
                <Package className="h-8 w-8 text-muted-foreground" />
                
                {/* شارة المخزون */}
                {settings.showProductStock && product.isStockTracked && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <Badge 
                      variant={isLowStock ? "destructive" : "secondary"}
                      className="w-full justify-center text-xs"
                    >
                      {stock} متبقي
                    </Badge>
                  </div>
                )}
              </div>
              <Separator className="mb-2" />
            </>
          )}

          {/* اسم المنتج */}
          {settings.showProductName && (
            <p
              className="font-bold truncate mb-1"
              style={{
                fontSize: settings.productNameFontSize,
                color: settings.productNameColor,
              }}
            >
              {product.name}
            </p>
          )}

          {/* الباركود */}
          {settings.showProductBarcode && (
            <p
              className="truncate mb-2"
              style={{
                fontSize: settings.productBarcodeFontSize,
                color: settings.productBarcodeColor,
              }}
            >
              {product.barcode}
            </p>
          )}

          {/* الخط الفاصل */}
          <Separator className="my-2" />

          {/* السعر */}
          {settings.showProductPrice && (
            <div className="mt-auto">
              <p
                className="font-bold"
                style={{
                  fontSize: settings.productPriceFontSize,
                  color: settings.productPriceColor,
                }}
              >
                {formatCurrency(product.sellingPrice, currency)}
              </p>
              {hasVariations && (
                <p className="text-xs text-muted-foreground mt-1">
                  أسعار متعددة متاحة
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

export { ProductCard };
