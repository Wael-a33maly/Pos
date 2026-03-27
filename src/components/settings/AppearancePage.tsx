'use client';

import { Palette, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';

const presetColors = [
  { name: 'أخضر', color: '#16a34a' },
  { name: 'أزرق', color: '#2563eb' },
  { name: 'بنفسجي', color: '#9333ea' },
  { name: 'برتقالي', color: '#ea580c' },
  { name: 'أحمر', color: '#dc2626' },
  { name: 'وردي', color: '#db2777' },
  { name: 'سماوي', color: '#0891b2' },
  { name: 'ذهبي', color: '#ca8a04' },
];

export function AppearancePage() {
  const { sidebarActiveColor, setSidebarActiveColor } = useAppStore();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تخصيص المظهر</h1>
        <p className="text-muted-foreground">تخصيص ألوان واجهة المستخدم</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            لون العنصر النشط
          </CardTitle>
          <CardDescription>اختر لون للعناصر النشطة في القائمة الجانبية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">الألوان المحددة مسبقاً</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {presetColors.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setSidebarActiveColor(preset.color)}
                  className="relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: preset.color,
                    borderColor: sidebarActiveColor === preset.color ? '#000' : 'transparent',
                  }}
                >
                  {sidebarActiveColor === preset.color && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">لون مخصص</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                value={sidebarActiveColor}
                onChange={(e) => setSidebarActiveColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={sidebarActiveColor}
                onChange={(e) => setSidebarActiveColor(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">معاينة</Label>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: sidebarActiveColor }}
                >
                  عنصر نشط
                </button>
                <button className="px-4 py-2 rounded-lg bg-muted font-medium">
                  عنصر غير نشط
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">اللون الحالي:</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: sidebarActiveColor }} />
              <code className="font-mono">{sidebarActiveColor}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
