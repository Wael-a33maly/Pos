// ============================================
// KPI Card Component - بطاقة المؤشرات
// ============================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrencyWithSettings } from '@/lib/currency';
import type { CurrencySettings } from '../types';

// Default currency settings (fallback)
const DEFAULT_CURRENCY: CurrencySettings = { code: 'EGP', symbol: 'ج.م', decimalPlaces: 2 };

// Format currency with dynamic currency
const formatValue = (value: number, currency?: CurrencySettings) => {
  const curr = currency || DEFAULT_CURRENCY;
  return formatCurrencyWithSettings(value, curr);
};

// Format number
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ar-SA').format(value);
};

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'currency' | 'number' | 'percent';
  index?: number;
  gradient?: string;
  currency?: CurrencySettings;
}

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.2 }
  },
};

const iconVariants = {
  rest: { rotate: 0, scale: 1 },
  hover: { 
    rotate: 10, 
    scale: 1.1,
    transition: { 
      type: "spring", 
      stiffness: 300 
    }
  },
};

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  format: formatType = 'currency',
  index = 0,
  gradient,
  currency,
}: KPICardProps) {
  const formattedValue = formatType === 'currency' 
    ? formatValue(value, currency)
    : formatType === 'percent'
    ? `${value.toFixed(1)}%`
    : formatNumber(value);

  const isPositive = change !== undefined && change > 0;
  const isNeutral = change !== undefined && change === 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <motion.div
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        className="h-full"
      >
        <Card className={cn(
          "relative overflow-hidden h-full transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/10",
          "border border-transparent hover:border-primary/10",
          "bg-gradient-to-br from-card via-card to-muted/20"
        )}>
          {/* Background Gradient */}
          <div className={cn(
            "absolute inset-0 opacity-[0.03]",
            gradient || "bg-gradient-to-br from-primary to-transparent"
          )} />
          
          {/* Animated Background Glow */}
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium tracking-wide">{title}</p>
                <motion.p 
                  className="text-2xl font-black mt-2 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {formattedValue}
                </motion.p>
                
                <AnimatePresence mode="wait">
                  {change !== undefined && (
                    <motion.div 
                      key={change}
                      className={cn(
                        "flex items-center gap-1.5 mt-3 text-sm",
                        isPositive && "text-emerald-600 dark:text-emerald-400",
                        isNegative && "text-rose-600 dark:text-rose-400",
                        isNeutral && "text-muted-foreground"
                      )}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <motion.span 
                        className={cn(
                          "p-1 rounded-full",
                          isPositive && "bg-emerald-100 dark:bg-emerald-900/30",
                          isNegative && "bg-rose-100 dark:bg-rose-900/30",
                          isNeutral && "bg-muted"
                        )}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : isNegative ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </motion.span>
                      <span className="font-bold">{Math.abs(change).toFixed(1)}%</span>
                      {changeLabel && (
                        <span className="text-muted-foreground text-xs">{changeLabel}</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.div 
                variants={iconVariants}
                className={cn(
                  "p-3 rounded-2xl shadow-inner",
                  "bg-gradient-to-br from-primary/20 to-primary/5",
                  "dark:from-primary/30 dark:to-primary/10"
                )}
              >
                <Icon className="h-6 w-6 text-primary" />
              </motion.div>
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-primary/5 blur-xl" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
