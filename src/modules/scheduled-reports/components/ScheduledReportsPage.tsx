// ============================================
// ScheduledReportsPage
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Plus, Edit, Trash2, Play, Pause, FileText,
  CheckCircle, XCircle, RefreshCw, Download, Mail
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  REPORT_TYPES, SCHEDULE_LABELS, FORMAT_LABELS,
  type ScheduledReport, type ReportExecution, type ScheduleType, type ReportFormat
} from '../types';

export function ScheduledReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', nameAr: '', description: '', reportType: 'sales',
    scheduleType: 'DAILY' as ScheduleType, time: '09:00',
    dayOfWeek: 0, dayOfMonth: 1, format: 'PDF' as ReportFormat,
    recipients: '', isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, executionsRes] = await Promise.all([
        fetch('/api/scheduled-reports'),
        fetch('/api/scheduled-reports?action=executions')
      ]);
      
      const reportsData = await reportsRes.json();
      const executionsData = await executionsRes.json();
      
      setReports(reportsData.reports || []);
      setExecutions(executionsData.executions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingReport ? '/api/scheduled-reports' : '/api/scheduled-reports';
      const method = editingReport ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReport ? { ...formData, id: editingReport.id } : formData)
      });
      
      if (response.ok) {
        toast.success(editingReport ? 'تم تحديث التقرير' : 'تم إنشاء التقرير');
        setShowDialog(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;
    
    try {
      await fetch(`/api/scheduled-reports?id=${id}`, { method: 'DELETE' });
      toast.success('تم حذف التقرير');
      fetchData();
    } catch {
      toast.error('فشل في الحذف');
    }
  };

  const toggleActive = async (report: ScheduledReport) => {
    try {
      await fetch('/api/scheduled-reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, isActive: !report.isActive })
      });
      fetchData();
    } catch {
      toast.error('فشل في التحديث');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', nameAr: '', description: '', reportType: 'sales',
      scheduleType: 'DAILY', time: '09:00',
      dayOfWeek: 0, dayOfMonth: 1, format: 'PDF',
      recipients: '', isActive: true
    });
    setEditingReport(null);
  };

  const openEditDialog = (report: ScheduledReport) => {
    setFormData({
      name: report.name,
      nameAr: report.nameAr || '',
      description: report.description || '',
      reportType: report.reportType,
      scheduleType: report.scheduleType as ScheduleType,
      time: report.time,
      dayOfWeek: report.dayOfWeek || 0,
      dayOfMonth: report.dayOfMonth || 1,
      format: report.format as ReportFormat,
      recipients: report.recipients,
      isActive: report.isActive
    });
    setEditingReport(report);
    setShowDialog(true);
  };

  // Stats
  const stats = {
    total: reports.length,
    active: reports.filter(r => r.isActive).length,
    completedToday: executions.filter(e => e.status === 'COMPLETED' && 
      new Date(e.createdAt).toDateString() === new Date().toDateString()).length,
    failed: executions.filter(e => e.status === 'FAILED').length
  };

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
          <h1 className="text-3xl font-bold">التقارير المجدولة</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            جدولة وإدارة التقارير التلقائية
          </p>
        </div>
        <Button className="gap-2" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="h-4 w-4" /> تقرير مجدول جديد
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">إجمالي التقارير</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">نشطة</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">منفذة اليوم</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">فاشلة</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">التقارير المجدولة</TabsTrigger>
          <TabsTrigger value="history">سجل التنفيذ</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardContent className="p-0">
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Calendar className="h-16 w-16 mb-4 opacity-50" />
                  <p>لا توجد تقارير مجدولة</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>اسم التقرير</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الجدولة</TableHead>
                      <TableHead>التنسيق</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.nameAr || report.name}</p>
                            {report.description && (
                              <p className="text-xs text-muted-foreground">{report.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {REPORT_TYPES.find(t => t.value === report.reportType)?.label || report.reportType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{SCHEDULE_LABELS[report.scheduleType as ScheduleType]}</span>
                            <span className="text-muted-foreground">{report.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{FORMAT_LABELS[report.format as ReportFormat]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={report.isActive}
                            onCheckedChange={() => toggleActive(report)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(report)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(report.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              {executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <RefreshCw className="h-16 w-16 mb-4 opacity-50" />
                  <p>لا يوجد سجل تنفيذ</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>نوع التقرير</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>السجلات</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>
                          {REPORT_TYPES.find(t => t.value === exec.reportType)?.label || exec.reportType}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            exec.status === 'COMPLETED' && "bg-emerald-500",
                            exec.status === 'FAILED' && "bg-red-500",
                            exec.status === 'RUNNING' && "bg-blue-500",
                            exec.status === 'PENDING' && "bg-amber-500"
                          )}>
                            {exec.status === 'COMPLETED' && 'مكتمل'}
                            {exec.status === 'FAILED' && 'فشل'}
                            {exec.status === 'RUNNING' && 'جاري'}
                            {exec.status === 'PENDING' && 'قيد الانتظار'}
                          </Badge>
                        </TableCell>
                        <TableCell>{exec.recordCount || '-'}</TableCell>
                        <TableCell>{exec.duration ? `${exec.duration}ms` : '-'}</TableCell>
                        <TableCell>
                          {new Date(exec.createdAt).toLocaleString('ar-EG')}
                        </TableCell>
                        <TableCell>
                          {exec.fileUrl && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 ml-2" /> تحميل
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReport ? 'تعديل تقرير' : 'تقرير مجدول جديد'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم (عربي)</Label>
                <Input 
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                />
              </div>
              <div>
                <Label>الاسم (إنجليزي)</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>نوع التقرير</Label>
              <Select value={formData.reportType} onValueChange={(v) => setFormData(prev => ({ ...prev, reportType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع الجدولة</Label>
                <Select value={formData.scheduleType} onValueChange={(v) => setFormData(prev => ({ ...prev, scheduleType: v as ScheduleType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">يومي</SelectItem>
                    <SelectItem value="WEEKLY">أسبوعي</SelectItem>
                    <SelectItem value="MONTHLY">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الوقت</Label>
                <Input 
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>التنسيق</Label>
                <Select value={formData.format} onValueChange={(v) => setFormData(prev => ({ ...prev, format: v as ReportFormat }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="EXCEL">Excel</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>تفعيل</Label>
              </div>
            </div>
            
            <div>
              <Label>المستلمين (بريد إلكتروني)</Label>
              <Textarea 
                placeholder="example@email.com, another@email.com"
                value={formData.recipients}
                onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
