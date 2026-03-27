'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  Users,
  Package,
  CreditCard,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterState {
  startDate?: Date;
  endDate?: Date;
  period?: string;
  branchIds?: string[];
  userIds?: string[];
  categoryIds?: string[];
  productIds?: string[];
  paymentMethodIds?: string[];
  shiftId?: string;
  groupBy?: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  showBranchFilter?: boolean;
  showUserFilter?: boolean;
  showCategoryFilter?: boolean;
  showProductFilter?: boolean;
  showPaymentMethodFilter?: boolean;
  showGroupBy?: boolean;
  defaultPeriod?: string;
}

export function FilterPanel({
  onFilterChange,
  showBranchFilter = true,
  showUserFilter = true,
  showCategoryFilter = false,
  showProductFilter = false,
  showPaymentMethodFilter = false,
  showGroupBy = true,
  defaultPeriod = 'today',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [period, setPeriod] = useState(defaultPeriod);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState('day');

  // Options
  const [branches, setBranches] = useState<FilterOption[]>([]);
  const [users, setUsers] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [products, setProducts] = useState<FilterOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<FilterOption[]>([]);

  // Fetch options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [branchesRes, usersRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/users'),
        ]);
        
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          setBranches(data.branches?.map((b: any) => ({ id: b.id, name: b.name })) || []);
        }
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users?.map((u: any) => ({ id: u.id, name: u.name })) || []);
        }

        if (showCategoryFilter) {
          const categoriesRes = await fetch('/api/categories');
          if (categoriesRes.ok) {
            const data = await categoriesRes.json();
            setCategories(data.categories?.map((c: any) => ({ id: c.id, name: c.name })) || []);
          }
        }

        if (showPaymentMethodFilter) {
          const paymentMethodsRes = await fetch('/api/payment-methods');
          if (paymentMethodsRes.ok) {
            const data = await paymentMethodsRes.json();
            setPaymentMethods(data.methods?.map((m: any) => ({ id: m.id, name: m.name })) || []);
          }
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchOptions();
  }, [showCategoryFilter, showPaymentMethodFilter]);

  // Apply filters
  const applyFilters = () => {
    const filters: FilterState = {
      period,
      groupBy,
    };

    if (period === 'custom') {
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
    }

    if (selectedBranches.length > 0) filters.branchIds = selectedBranches;
    if (selectedUsers.length > 0) filters.userIds = selectedUsers;
    if (selectedCategories.length > 0) filters.categoryIds = selectedCategories;
    if (selectedProducts.length > 0) filters.productIds = selectedProducts;
    if (selectedPaymentMethods.length > 0) filters.paymentMethodIds = selectedPaymentMethods;

    onFilterChange(filters);
  };

  // Clear filters
  const clearFilters = () => {
    setPeriod(defaultPeriod);
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedBranches([]);
    setSelectedUsers([]);
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedPaymentMethods([]);
    setGroupBy('day');
    onFilterChange({ period: defaultPeriod, groupBy: 'day' });
  };

  // Count active filters
  const activeFiltersCount = [
    period !== defaultPeriod,
    selectedBranches.length > 0,
    selectedUsers.length > 0,
    selectedCategories.length > 0,
    selectedProducts.length > 0,
    selectedPaymentMethods.length > 0,
  ].filter(Boolean).length;

  // Toggle selection
  const toggleSelection = (id: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            الفلاتر
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 ml-1" />
                مسح
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الفترة الزمنية</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'today', label: 'اليوم' },
                { value: 'yesterday', label: 'أمس' },
                { value: 'week', label: 'هذا الأسبوع' },
                { value: 'month', label: 'هذا الشهر' },
                { value: 'year', label: 'هذا العام' },
                { value: 'custom', label: 'مخصص' },
              ].map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 ml-2" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'من تاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 ml-2" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'إلى تاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Group By */}
          {showGroupBy && (
            <div className="space-y-2">
              <label className="text-sm font-medium">تجميع حسب</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">الساعة</SelectItem>
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="week">الأسبوع</SelectItem>
                  <SelectItem value="month">الشهر</SelectItem>
                  <SelectItem value="year">السنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Branch Filter */}
          {showBranchFilter && branches.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                الفروع
              </label>
              <ScrollArea className="h-24 border rounded-md p-2">
                {branches.map((branch) => (
                  <div key={branch.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`branch-${branch.id}`}
                      checked={selectedBranches.includes(branch.id)}
                      onCheckedChange={() => toggleSelection(branch.id, selectedBranches, setSelectedBranches)}
                    />
                    <label htmlFor={`branch-${branch.id}`} className="text-sm cursor-pointer">
                      {branch.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* User Filter */}
          {showUserFilter && users.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                المستخدمين
              </label>
              <ScrollArea className="h-24 border rounded-md p-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleSelection(user.id, selectedUsers, setSelectedUsers)}
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                      {user.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Category Filter */}
          {showCategoryFilter && categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                الفئات
              </label>
              <ScrollArea className="h-24 border rounded-md p-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleSelection(category.id, selectedCategories, setSelectedCategories)}
                    />
                    <label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                      {category.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Payment Method Filter */}
          {showPaymentMethodFilter && paymentMethods.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                طرق الدفع
              </label>
              <ScrollArea className="h-24 border rounded-md p-2">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      id={`method-${method.id}`}
                      checked={selectedPaymentMethods.includes(method.id)}
                      onCheckedChange={() => toggleSelection(method.id, selectedPaymentMethods, setSelectedPaymentMethods)}
                    />
                    <label htmlFor={`method-${method.id}`} className="text-sm cursor-pointer">
                      {method.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Apply Button */}
          <Button onClick={applyFilters} className="w-full">
            تطبيق الفلاتر
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
