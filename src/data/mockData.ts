// البيانات الأولية للنظام

import type { Region, Observer, User, WeeklyStats, Evaluation, ImprovementItem, PointsSystem } from '@/types';

// المناطق
export const regions: Region[] = [
  { id: '1', name: 'سكاكا' },
  { id: '2', name: 'القريات' },
  { id: '3', name: 'طبرجل' },
  { id: '4', name: 'دومة الجندل' },
];

// المراقبين
export const observers: Observer[] = [
  // سكاكا
  { id: '1', name: 'لطيفه عديد عويد الرويلي', regionId: '1', status: 'active' },
  { id: '2', name: 'عادل نشمي العنزي', regionId: '1', status: 'active' },
  { id: '3', name: 'عبدالعزيز نمر فريح الرويلي', regionId: '1', status: 'active' },
  // القريات
  { id: '4', name: 'سليمان محمد عبدالله الحميدان', regionId: '2', status: 'active' },
  { id: '5', name: 'مسفر علي آل جريب', regionId: '2', status: 'active' },
  { id: '6', name: 'سويلم مشارع معتق الشراري', regionId: '2', status: 'active' },
  { id: '7', name: 'وفاء اسماعيل حامد العيسى', regionId: '2', status: 'active' },
  { id: '8', name: 'فضه فارس صالح الجريد', regionId: '2', status: 'active' },
  // طبرجل
  { id: '9', name: 'صالح فلاح صبيح الشراري', regionId: '3', status: 'active' },
  { id: '10', name: 'سعيد بصيلان الشراري', regionId: '3', status: 'active' },
  // دومة الجندل
  { id: '11', name: 'سعد مدالله ناوي الشراري', regionId: '4', status: 'active' },
];

// المستخدمين
export const users: User[] = [
  { id: '1', name: 'موظف الجودة الأول', role: 'quality1', username: 'quality1' },
  { id: '2', name: 'موظف الجودة الثاني', role: 'quality2', username: 'quality2' },
  { id: '3', name: 'المشرف العام', role: 'supervisor', username: 'supervisor' },
];

// نظام النقاط الإيجابي - جميع القيم موجبة
export const pointsSystem: PointsSystem = {
  visits: { 
    points: 1, 
    description: 'نقطة إيجابية لكل زيارة ميدانية' 
  },
  violations: { 
    points: 4, 
    description: '4 نقاط إيجابية للمخالفة (رصد دقيق للأخطاء)' 
  },
  warnings: { 
    points: 3, 
    description: '3 نقاط إيجابية للإنذار (تنبيه وقائي)' 
  },
  grades: {
    excellent: { 
      points: 10, 
      description: 'ممتاز - أداء استثنائي' 
    },
    very_good: { 
      points: 8, 
      description: 'جيد جداً - أداء متميز' 
    },
    acceptable: { 
      points: 5, 
      description: 'مقبول - يلبي المتطلبات' 
    },
    needs_improvement: { 
      points: 2, 
      description: 'يحتاج تحسين - فرصة للتطوير' 
    },
    neutral: { 
      points: 0, 
      description: 'محايد - لا يؤثر' 
    },
    on_leave: { 
      points: 0, 
      description: 'في إجازة - معفى' 
    },
  },
};

// الإحصائيات الأسبوعية - فارغة في البداية
export const weeklyStats: WeeklyStats[] = [];

// التقييمات - فارغة في البداية
export const evaluations: Evaluation[] = [];

// سلة التحسين
export const improvementItems: ImprovementItem[] = [];

// دوال مساعدة
export const getRegionName = (regionId: string): string => {
  const region = regions.find(r => r.id === regionId);
  return region?.name || 'غير معروف';
};

export const getObserverName = (observerId: string): string => {
  const observer = observers.find(o => o.id === observerId);
  return observer?.name || 'غير معروف';
};

export const getGradeLabel = (grade: string): string => {
  const labels: Record<string, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جداً',
    acceptable: 'مقبول',
    needs_improvement: 'يحتاج تحسين',
    neutral: 'محايد',
    on_leave: 'في إجازة',
  };
  return labels[grade] || grade;
};

export const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    excellent: 'bg-emerald-500',
    very_good: 'bg-teal-500',
    acceptable: 'bg-yellow-500',
    needs_improvement: 'bg-orange-500',
    neutral: 'bg-gray-400',
    on_leave: 'bg-blue-400',
  };
  return colors[grade] || 'bg-gray-400';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'معلق',
    approved: 'معتمد',
    rejected: 'مرفوض',
    returned: 'معاد للتعديل',
  };
  return labels[status] || status;
};
