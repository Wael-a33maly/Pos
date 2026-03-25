'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Store,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Filter,
  Sparkles,
  Rocket,
  Target,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Types
interface KPIStats {
  todaySales: number;
  yesterdaySales: number;
  salesChange: number;
  todayInvoices: number;
  averageOrderValue: number;
  totalProfit: number;
  profitMargin: number;
  topBranch: { id: string; name: string; sales: number } | null;
  topProduct: { id: string; name: string; quantity: number } | null;
  topCashier: { id: string; name: string; sales: number } | null;
  activeShifts: number;
  lowStockProducts: number;
}

interface HourlySales {
  hour: number;
  sales: number;
  invoices: number;
}

interface PaymentDistribution {
  method: string;
  methodAr: string;
  amount: number;
  count: number;
  percentage: number;
}

interface DailySales {
  date: string;
  sales: number;
  profit: number;
  invoices: number;
}

interface TopProduct {
  id: string;
  name: string;
  nameAr: string | null;
  quantity: number;
  revenue: number;
  profit: number;
}

interface BranchPerformance {
  id: string;
  name: string;
  sales: number;
  profit: number;
  invoices: number;
  growth: number;
}

interface DashboardData {
  kpis: KPIStats;
  hourlySales: HourlySales[];
  paymentDistribution: PaymentDistribution[];
  dailySales: DailySales[];
  topProducts: TopProduct[];
  branchPerformance: BranchPerformance[];
  recentInvoices: any[];
  lowStockAlert: any[];
}

// Colors for charts
const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Currency settings interface
interface CurrencySettings {
  code: string;
  symbol: string;
  decimalPlaces: number;
}

// Format currency with dynamic currency
const formatCurrency = (value: number, currency: CurrencySettings = { code: 'SAR', symbol: 'ر.س', decimalPlaces: 2 }) => {
  try {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    }).format(value);
  } catch {
    // Fallback if currency code is not valid
    return `${value.toFixed(currency.decimalPlaces)} ${currency.symbol}`;
  }
};

// Format number
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('ar-SA').format(value);
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

// KPI Card Component with animations
function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  format: formatType = 'currency',
  index = 0,
  gradient,
  currency,
}: {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  format?: 'currency' | 'number' | 'percent';
  index?: number;
  gradient?: string;
  currency?: CurrencySettings;
}) {
  const formattedValue = formatType === 'currency' 
    ? formatCurrency(value, currency)
    : formatType === 'percent'
    ? `${value.toFixed(1)}%`
    : formatNumber(value);

  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="rest"
        whileHover="hover"
        className="h-full"
      >
        <Card className={cn(
          "relative overflow-hidden h-full transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5",
          "border-transparent hover:border-primary/20"
        )}>
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 opacity-5",
            gradient || "bg-gradient-to-br from-primary to-transparent"
          )} />
          
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <motion.p 
                  className="text-3xl font-bold mt-2 bg-gradient-to-l bg-clip-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {formattedValue}
                </motion.p>
                {change !== undefined && (
                  <motion.div 
                    className={cn(
                      "flex items-center gap-1.5 mt-3 text-sm",
                      isPositive ? "text-emerald-600" : "text-rose-600"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span className={cn(
                      "p-1 rounded-full",
                      isPositive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"
                    )}>
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    </span>
                    <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
                    {changeLabel && <span className="text-muted-foreground text-xs">{changeLabel}</span>}
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className={cn(
                  "p-4 rounded-2xl shadow-inner",
                  "bg-gradient-to-br from-primary/20 to-primary/5",
                  "dark:from-primary/30 dark:to-primary/10"
                )}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="h-7 w-7 text-primary" />
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Quick Action Button
function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl",
        "bg-gradient-to-br from-muted/50 to-muted/30",
        "hover:from-muted hover:to-muted/50",
        "transition-all duration-300 group"
      )}
    >
      <div className={cn(
        "p-3 rounded-xl transition-all duration-300",
        "group-hover:scale-110",
        color
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </motion.button>
  );
}

// Mini KPI Card with animation
function MiniKPICard({
  title,
  value,
  icon: Icon,
  color = 'text-primary',
  index = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/40 transition-all duration-300"
    >
      <div className={cn("p-2.5 rounded-xl bg-background/50", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="font-bold text-lg">{value}</p>
      </div>
    </motion.div>
  );
}

// Skeleton loader
function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
            <div className="h-14 w-14 bg-muted rounded-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [currency, setCurrency] = useState<CurrencySettings>({ code: 'SAR', symbol: 'ر.س', decimalPlaces: 2 });

  // Fetch settings for currency
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const result = await res.json();
          const settings = result.settings || {};
          if (settings.defaultCurrency) {
            // Find currency from currencies list
            try {
              const currencies = settings.currencies ? JSON.parse(settings.currencies) : [];
              const defaultCurrency = currencies.find((c: any) => c.code === settings.defaultCurrency || c.isDefault);
              if (defaultCurrency) {
                setCurrency({
                  code: defaultCurrency.code,
                  symbol: defaultCurrency.symbol,
                  decimalPlaces: defaultCurrency.decimalPlaces || 2,
                });
              }
            } catch {
              // Use default currency code if currencies list is not available
              setCurrency(prev => ({ ...prev, code: settings.defaultCurrency }));
            }
          }
          if (settings.decimalPlaces) {
            setCurrency(prev => ({ ...prev, decimalPlaces: parseInt(settings.decimalPlaces) }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    };
    fetchSettings();
  }, []);

  // Fetch branches for filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || data || []);
        }
      } catch (e) {
        console.error('Failed to fetch branches:', e);
      }
    };
    fetchBranches();
  }, []);

  // Fetch dashboard data
  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.set('branchId', selectedBranch);
      
      const res = await fetch(`/api/dashboard/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (e) {
      setError('حدث خطأ في تحميل البيانات');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranch]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedBranch]);

  // Prepare chart data
  const hourlyChartData = useMemo(() => {
    if (!data?.hourlySales) return [];
    return data.hourlySales.map(item => ({
      ...item,
      hourLabel: `${item.hour}:00`,
    }));
  }, [data?.hourlySales]);

  const paymentChartData = useMemo(() => {
    if (!data?.paymentDistribution) return [];
    return data.paymentDistribution.map(item => ({
      name: item.methodAr,
      value: item.amount,
      percentage: item.percentage,
    }));
  }, [data?.paymentDistribution]);

  const dailyChartData = useMemo(() => {
    if (!data?.dailySales) return [];
    return data.dailySales.map(item => ({
      ...item,
      dateLabel: format(parseISO(item.date), 'EEE', { locale: ar }),
    }));
  }, [data?.dailySales]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
            <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <AlertTriangle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          </motion.div>
          <p className="text-lg font-medium mb-2">{error || 'لا توجد بيانات'}</p>
          <p className="text-muted-foreground mb-4">حدث خطأ أثناء تحميل البيانات</p>
          <Button onClick={() => fetchData()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </motion.div>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="p-6 space-y-6 pb-10">
      {/* Header with animation */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text">
            لوحة التحكم
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ar })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedBranch || 'all'} onValueChange={(v) => setSelectedBranch(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] bg-background/50">
              <Store className="h-4 w-4 ml-2 text-muted-foreground" />
              <SelectValue placeholder="جميع الفروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="relative overflow-hidden"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              {!refreshing && (
                <motion.div
                  className="absolute inset-0 bg-primary/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 overflow-x-auto pb-2"
      >
        <QuickActionButton icon={ShoppingCart} label="نقطة بيع" color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <QuickActionButton icon={Package} label="المنتجات" color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <QuickActionButton icon={FileText} label="التقارير" color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <QuickActionButton icon={Users} label="العملاء" color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
        <QuickActionButton icon={Clock} label="الورديات" color="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <KPICard
          title="مبيعات اليوم"
          value={kpis.todaySales}
          change={kpis.salesChange}
          changeLabel="مقارنة بأمس"
          icon={DollarSign}
          index={0}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          currency={currency}
        />
        <KPICard
          title="عدد الفواتير"
          value={kpis.todayInvoices}
          format="number"
          icon={ShoppingCart}
          index={1}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <KPICard
          title="متوسط قيمة الفاتورة"
          value={kpis.averageOrderValue}
          icon={Target}
          index={2}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          currency={currency}
        />
        <KPICard
          title="هامش الربح"
          value={kpis.profitMargin}
          format="percent"
          icon={TrendingUp}
          index={3}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </motion.div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPICard
          title="الربح اليوم"
          value={formatCurrency(kpis.totalProfit, currency)}
          icon={Sparkles}
          color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
          index={0}
        />
        <MiniKPICard
          title="ورديات نشطة"
          value={kpis.activeShifts}
          icon={Zap}
          color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
          index={1}
        />
        <MiniKPICard
          title="منتجات منخفضة"
          value={kpis.lowStockProducts}
          icon={AlertTriangle}
          color="text-amber-600 bg-amber-100 dark:bg-amber-900/30"
          index={2}
        />
        <MiniKPICard
          title="أفضل فرع"
          value={kpis.topBranch?.name || '-'}
          icon={Rocket}
          color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    المبيعات الأسبوعية
                  </CardTitle>
                  <CardDescription>آخر 7 أيام</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>تصدير كصورة</DropdownMenuItem>
                    <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dateLabel" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      labelStyle={{ direction: 'rtl' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      name="المبيعات" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      name="الربح" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorProfit)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hourly Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    المبيعات بالساعة
                  </CardTitle>
                  <CardDescription>توزيع المبيعات اليوم</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3" />
                  مباشر
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hourLabel" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      name="المبيعات" 
                      fill="#10b981" 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                طرق الدفع
              </CardTitle>
              <CardDescription>توزيع طرق الدفع اليوم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentChartData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {data.paymentDistribution.map((item, index) => (
                  <motion.div 
                    key={item.method} 
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span>{item.methodAr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.amount, currency)}</span>
                      <Badge variant="outline" className="text-xs">{item.percentage.toFixed(0)}%</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                أفضل المنتجات
              </CardTitle>
              <CardDescription>الأكثر مبيعاً هذا الأسبوع</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {data.topProducts.map((product, index) => (
                    <motion.div 
                      key={product.id} 
                      className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-l from-muted/30 to-transparent hover:from-muted/50 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                        index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                        index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(product.quantity)} قطعة
                          </Badge>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{formatCurrency(product.revenue, currency)}</p>
                        <p className="text-sm text-emerald-600 font-medium">
                          +{formatCurrency(product.profit, currency)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Branch Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                أداء الفروع
              </CardTitle>
              <CardDescription>مقارنة المبيعات هذا الأسبوع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.branchPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={70} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value, currency)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar 
                      dataKey="sales" 
                      name="المبيعات" 
                      fill="#10b981" 
                      radius={[0, 6, 6, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <ScrollArea className="h-[130px]">
                <div className="space-y-3">
                  {data.branchPerformance.map((branch, index) => (
                    <motion.div 
                      key={branch.id} 
                      className="flex items-center justify-between text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{branch.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(branch.sales, currency)}</span>
                        <Badge variant="outline" className="text-xs">{branch.invoices} فاتورة</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    آخر الفواتير
                  </CardTitle>
                  <CardDescription>أحدث العمليات</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  عرض الكل
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {data.recentInvoices.map((invoice, index) => (
                    <motion.div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-muted/30 to-transparent hover:from-muted/50 transition-all duration-300 cursor-pointer group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      whileHover={{ x: -5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.branch?.name} • {invoice.user?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{formatCurrency(invoice.totalAmount, currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(invoice.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  تنبيه المخزون
                </CardTitle>
                {data.lowStockAlert.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {data.lowStockAlert.length} منتج
                  </Badge>
                )}
              </div>
              <CardDescription>منتجات تحتاج إعادة طلب</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <AnimatePresence mode="popLayout">
                  {data.lowStockAlert.length > 0 ? (
                    <div className="space-y-3">
                      {data.lowStockAlert.map((item: any, index: number) => (
                        <motion.div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-amber-50 to-transparent dark:from-amber-950/30 border border-amber-200 dark:border-amber-800/50"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                              <Package className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.category?.name} • الحد الأدنى: {item.minStock || 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {item.quantity || 0} متبقي
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Package className="h-16 w-16 mx-auto text-emerald-500 mb-4 opacity-50" />
                      </motion.div>
                      <p className="text-muted-foreground font-medium">ممتاز!</p>
                      <p className="text-sm text-muted-foreground">لا توجد منتجات منخفضة المخزون</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
