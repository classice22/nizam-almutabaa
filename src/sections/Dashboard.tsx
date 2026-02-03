import { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface DashboardProps {
  getDashboardStats: () => DashboardStats;
}

export function Dashboard({ getDashboardStats }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(getDashboardStats());
  }, [getDashboardStats]);

  if (!stats) return null;

  const statCards = [
    { 
      title: 'إجمالي المراقبين', 
      value: stats.totalObservers, 
      icon: Users, 
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    },
    { 
      title: 'المراقبين النشطين', 
      value: stats.activeObservers, 
      icon: UserCheck, 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    { 
      title: 'في إجازة', 
      value: stats.onLeaveObservers, 
      icon: UserX, 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      title: 'بانتظار الاعتماد', 
      value: stats.pendingApprovals, 
      icon: Clock, 
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)'
    },
    { 
      title: 'الزيارات الأسبوعية', 
      value: stats.weeklyVisits, 
      icon: ClipboardCheck, 
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    },
    { 
      title: 'المخالفات الأسبوعية', 
      value: stats.weeklyViolations, 
      icon: AlertTriangle, 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
  ];

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-400">نظرة عامة على أداء مراقبي الجودة</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: card.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card-custom">
          <h3 className="text-white font-bold text-lg mb-4">إجراءات سريعة</h3>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 text-right">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium">إدخال إحصائيات جديدة</p>
                <p className="text-gray-400 text-sm">تسجيل بيانات أداء المراقبين</p>
              </div>
            </button>
            <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 text-right">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">عرض التقارير</p>
                <p className="text-gray-400 text-sm">الإحصائيات والتحليلات</p>
              </div>
            </button>
            <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-4 text-right">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">سلة التحسين</p>
                <p className="text-gray-400 text-sm">مراجعة خطط التحسين</p>
              </div>
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="card-custom">
          <h3 className="text-white font-bold text-lg mb-4">معلومات النظام</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">السنة الحالية</span>
              <span className="text-white font-bold">2026</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">الشهر الحالي</span>
              <span className="text-white font-bold">يناير</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">الأسبوع الحالي</span>
              <span className="text-white font-bold">الأسبوع 5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">عدد المناطق</span>
              <span className="text-white font-bold">4 مناطق</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
