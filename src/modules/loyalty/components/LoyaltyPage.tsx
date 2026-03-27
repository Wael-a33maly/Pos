// ============================================
// LoyaltyPage - صفحة نظام الولاء
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Users, Star, Settings, Plus, Edit, Trash2, Search,
  Crown, Sparkles, TrendingUp, Award, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore, formatCurrency } from '@/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { 
  DEFAULT_LOYALTY_SETTINGS, 
  TIER_COLORS, 
  TRANSACTION_TYPE_LABELS,
  type LoyaltySetting, 
  type LoyaltyTier, 
  type CustomerLoyalty,
  type LoyaltyTransaction 
} from '../types';

export function LoyaltyPage() {
  const { currency } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<LoyaltySetting>(DEFAULT_LOYALTY_SETTINGS);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loyaltyMembers, setLoyaltyMembers] = useState<CustomerLoyalty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CustomerLoyalty | null>(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  
  // Form data for tier
  const [tierForm, setTierForm] = useState({
    name: '', nameAr: '', level: 1, minPoints: 0, maxPoints: null as number | null,
    discountPercent: 0, pointsMultiplier: 1, freeShipping: false, specialOffers: false,
    color: '#3b82f6'
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, tiersRes, membersRes] = await Promise.all([
        fetch('/api/loyalty?action=settings'),
        fetch('/api/loyalty?action=tiers'),
        fetch('/api/loyalty')
      ]);
      
      const settingsData = await settingsRes.json();
      const tiersData = await tiersRes.json();
      const membersData = await membersRes.json();
      
      if (settingsData.settings) setSettings(settingsData.settings);
      if (tiersData.tiers) setTiers(tiersData.tiers);
      if (membersData.loyalties) setLoyaltyMembers(membersData.loyalties);
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<LoyaltySetting>) => {
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSettings',
          ...settings,
          ...newSettings
        })
      });
      
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        toast.success('تم تحديث الإعدادات');
      }
    } catch (error) {
      toast.error('فشل في تحديث الإعدادات');
    }
  };

  const createTier = async () => {
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createTier',
          ...tierForm
        })
      });
      
      if (response.ok) {
        toast.success('تم إنشاء المستوى');
        setShowTierDialog(false);
        fetchData();
      }
    } catch (error) {
      toast.error('فشل في إنشاء المستوى');
    }
  };

  const adjustMemberPoints = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await fetch('/api/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjustPoints',
          customerId: selectedMember.customerId,
          points: adjustPoints,
          description: adjustReason
        })
      });
      
      if (response.ok) {
        toast.success('تم تعديل النقاط');
        setShowAdjustDialog(false);
        fetchData();
      }
    } catch (error) {
      toast.error('فشل في تعديل النقاط');
    }
  };

  // Stats
  const stats = {
    totalMembers: loyaltyMembers.length,
    activeMembers: loyaltyMembers.filter(m => m.totalPoints > 0).length,
    totalPoints: loyaltyMembers.reduce((sum, m) => sum + m.totalPoints, 0),
    avgPoints: loyaltyMembers.length > 0 
      ? Math.round(loyaltyMembers.reduce((sum, m) => sum + m.totalPoints, 0) / loyaltyMembers.length)
      : 0
  };

  const filteredMembers = loyaltyMembers.filter(m => 
    m.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.customer?.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-10">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">نظام الولاء</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Gift className="h-4 w-4" />
            إدارة نقاط ومستويات العملاء
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Switch 
              checked={settings.isEnabled} 
              onCheckedChange={(checked) => updateSettings({ isEnabled: checked })}
            />
            <Label>{settings.isEnabled ? 'مفعّل' : 'معطّل'}</Label>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي الأعضاء</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">أعضاء نشطون</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي النقاط</p>
                <p className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">متوسط النقاط</p>
                <p className="text-2xl font-bold">{stats.avgPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">الأعضاء</TabsTrigger>
          <TabsTrigger value="tiers">المستويات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="بحث بالاسم أو الهاتف..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">لا يوجد أعضاء</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>العميل</TableHead>
                      <TableHead>المستوى</TableHead>
                      <TableHead>النقاط المتاحة</TableHead>
                      <TableHead>إجمالي النقاط</TableHead>
                      <TableHead>المشتريات</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.customer?.name}</p>
                            <p className="text-xs text-muted-foreground">{member.customer?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.tier ? (
                            <Badge style={{ backgroundColor: member.tier.color, color: '#fff' }}>
                              <Crown className="h-3 w-3 ml-1" />
                              {member.tier.nameAr}
                            </Badge>
                          ) : (
                            <Badge variant="outline">بدون مستوى</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-emerald-600">{member.availablePoints}</span>
                        </TableCell>
                        <TableCell>{member.totalPoints}</TableCell>
                        <TableCell>{formatCurrency(member.totalPurchases, currency)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowAdjustDialog(true);
                            }}
                          >
                            تعديل النقاط
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">مستويات الولاء</h3>
            <Button onClick={() => setShowTierDialog(true)}>
              <Plus className="h-4 w-4 ml-2" /> مستوى جديد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div 
                    className="h-2"
                    style={{ backgroundColor: tier.color }}
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" style={{ color: tier.color }} />
                        {tier.nameAr}
                      </CardTitle>
                      <Badge variant="outline">المستوى {tier.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">النقاط المطلوبة</span>
                      <span className="font-medium">{tier.minPoints} - {tier.maxPoints || '∞'}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {tier.discountPercent > 0 ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>خصم {tier.discountPercent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tier.pointsMultiplier > 1 ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>مضاعف {tier.pointsMultiplier}x</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tier.freeShipping ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>شحن مجاني</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tier.specialOffers ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>عروض خاصة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات برنامج الولاء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">نظام النقاط</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>نقطة لكل (عملة)</Label>
                      <Input 
                        type="number" 
                        value={settings.pointsPerCurrency}
                        onChange={(e) => updateSettings({ pointsPerCurrency: parseFloat(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>قيمة النقطة (عملة)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={settings.currencyPerPoint}
                        onChange={(e) => updateSettings({ currencyPerPoint: parseFloat(e.target.value) || 0.1 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">شروط الاستبدال</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>الحد الأدنى للنقاط للاستبدال</Label>
                      <Input 
                        type="number" 
                        value={settings.minRedeemPoints}
                        onChange={(e) => updateSettings({ minRedeemPoints: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                    <div>
                      <Label>أقصى نسبة خصم من الفاتورة (%)</Label>
                      <Input 
                        type="number" 
                        value={settings.maxRedeemPercent}
                        onChange={(e) => updateSettings({ maxRedeemPercent: parseFloat(e.target.value) || 50 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">صلاحية النقاط</h4>
                  <div>
                    <Label>صلاحية النقاط (أيام)</Label>
                    <Input 
                      type="number" 
                      value={settings.pointsValidityDays}
                      onChange={(e) => updateSettings({ pointsValidityDays: parseInt(e.target.value) || 365 })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">نقاط المكافآت</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>نقاط الترحيب</Label>
                      <Input 
                        type="number" 
                        value={settings.welcomeBonusPoints}
                        onChange={(e) => updateSettings({ welcomeBonusPoints: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>نقاط عيد الميلاد</Label>
                      <Input 
                        type="number" 
                        value={settings.birthdayBonusPoints}
                        onChange={(e) => updateSettings({ birthdayBonusPoints: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Tier Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إنشاء مستوى ولاء جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم (عربي)</Label>
                <Input 
                  value={tierForm.nameAr}
                  onChange={(e) => setTierForm(prev => ({ ...prev, nameAr: e.target.value }))}
                />
              </div>
              <div>
                <Label>الاسم (إنجليزي)</Label>
                <Input 
                  value={tierForm.name}
                  onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المستوى</Label>
                <Input 
                  type="number"
                  value={tierForm.level}
                  onChange={(e) => setTierForm(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label>اللون</Label>
                <Input 
                  type="color"
                  value={tierForm.color}
                  onChange={(e) => setTierForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الحد الأدنى للنقاط</Label>
                <Input 
                  type="number"
                  value={tierForm.minPoints}
                  onChange={(e) => setTierForm(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>الحد الأقصى (اختياري)</Label>
                <Input 
                  type="number"
                  value={tierForm.maxPoints || ''}
                  onChange={(e) => setTierForm(prev => ({ 
                    ...prev, 
                    maxPoints: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نسبة الخصم (%)</Label>
                <Input 
                  type="number"
                  value={tierForm.discountPercent}
                  onChange={(e) => setTierForm(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>مضاعف النقاط</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={tierForm.pointsMultiplier}
                  onChange={(e) => setTierForm(prev => ({ ...prev, pointsMultiplier: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>إلغاء</Button>
            <Button onClick={createTier}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Points Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل نقاط العميل</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedMember.customer?.name}</p>
                <p className="text-sm text-muted-foreground">
                  الرصيد الحالي: <span className="font-bold text-emerald-600">{selectedMember.availablePoints}</span> نقطة
                </p>
              </div>
              
              <div>
                <Label>عدد النقاط (+ إضافة / - خصم)</Label>
                <Input 
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label>السبب</Label>
                <Input 
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="مثال: تعويض عن مشكلة سابقة"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>إلغاء</Button>
            <Button onClick={adjustMemberPoints}>تأكيد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
