import { useState, useMemo } from 'react';
import type { TimePeriod, WeeklyStats, Evaluation } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, Filter, FileSpreadsheet } from 'lucide-react';
import { observers, getRegionName, pointsSystem } from '@/data/mockData';

interface ExecutiveStatisticsProps {
  stats: WeeklyStats[];
  evaluations: Evaluation[];
}

export function ExecutiveStatistics({ stats: allStats, evaluations: allEvaluations }: ExecutiveStatisticsProps) {
  const [period, setPeriod] = useState<TimePeriod>({ week: 1, month: 1, year: 2026 });
  const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');

  // فلترة الإحصائيات المعتمدة فقط (غير الإجازة)
  const periodStats = allStats.filter(s => 
    s.month === period.month && 
    s.year === period.year &&
    (period.week === undefined || s.week === period.week)
  );
  const stats = periodStats.filter(s => s.status === 'approved' && !s.isOnLeave);
  const periodEvals = allEvaluations.filter(e => 
    e.month === period.month && 
    e.year === period.year &&
    (period.week === undefined || e.week === period.week)
  );
  const evaluations = periodEvals.filter(e => {
    const relatedStat = periodStats.find(s => 
      s.observerId === e.observerId && 
      s.week === e.week && 
      s.month === e.month && 
      s.year === e.year
    );
    return relatedStat && relatedStat.status === 'approved' && !relatedStat.isOnLeave;
  });

  // حساب لوحة الشرف مباشرة
  const honorBoard = useMemo(() => {
    const approvedStats = periodStats.filter(s => s.status === 'approved' && !s.isOnLeave);
    const observersWithApprovedStats = new Set(approvedStats.map(s => s.observerId));
    const observersWithEvaluations = new Set(periodEvals.map(e => e.observerId));
    
    const eligibleObservers = observers.filter(o => 
      observersWithApprovedStats.has(o.id) && observersWithEvaluations.has(o.id)
    );
    
    const entries = eligibleObservers.map(observer => {
      const observerStats = approvedStats.filter(s => s.observerId === observer.id);
      const observerEvals = periodEvals.filter(e => e.observerId === observer.id);
      const evaluation = observerEvals[0];
      
      const visitsCount = observerStats.reduce((sum, s) => sum + s.visitsCount, 0);
      const violationsCount = observerStats.reduce((sum, s) => sum + s.violationsCount, 0);
      const warningsCount = observerStats.reduce((sum, s) => sum + s.warningsCount, 0);
      const supervisorPoints = observerEvals.reduce((sum, e) => sum + e.supervisorPoints, 0);
      
      let totalPoints = 0;
      totalPoints += visitsCount * pointsSystem.visits.points;
      totalPoints += violationsCount * pointsSystem.violations.points;
      totalPoints += warningsCount * pointsSystem.warnings.points;
      observerEvals.forEach(eval_ => {
        totalPoints += pointsSystem.grades[eval_.grade].points;
        totalPoints += eval_.supervisorPoints;
      });
      
      return {
        observerId: observer.id,
        observerName: observer.name,
        regionName: getRegionName(observer.regionId),
        totalPoints,
        visitsCount,
        violationsCount,
        warningsCount,
        supervisorPoints,
        rank: 0,
        evaluation,
      };
    });
    
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries;
  }, [periodStats, periodEvals]);

  // بيانات الرسوم البيانية
  const visitsData = useMemo(() => {
    return stats.map(stat => ({
      name: stat.observerId,
      visits: stat.visitsCount,
      violations: stat.violationsCount,
    }));
  }, [stats]);

  const gradesData = useMemo(() => {
    const grades: Record<string, number> = { 
      excellent: 0, 
      very_good: 0, 
      acceptable: 0, 
      needs_improvement: 0, 
      neutral: 0,
      on_leave: 0 
    };
    evaluations.forEach(e => {
      if (grades.hasOwnProperty(e.grade)) {
        grades[e.grade]++;
      }
    });
    return [
      { name: 'ممتاز', value: grades.excellent, color: '#10b981' },
      { name: 'جيد جداً', value: grades.very_good, color: '#14b8a6' },
      { name: 'مقبول', value: grades.acceptable, color: '#f59e0b' },
      { name: 'يحتاج تحسين', value: grades.needs_improvement, color: '#f97316' },
    ];
  }, [evaluations]);

  // Generate years 2024-2040
  const years = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i);
  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
  ];
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const totalVisits = stats.reduce((sum, s) => sum + s.visitsCount, 0);
  const totalViolations = stats.reduce((sum, s) => sum + s.violationsCount, 0);
  const totalWarnings = stats.reduce((sum, s) => sum + s.warningsCount, 0);

  // تصدير البيانات إلى Excel
  const exportToExcel = () => {
    const periodLabel = viewType === 'weekly' 
      ? `${period.year}-${period.month}-W${period.week}` 
      : viewType === 'monthly' 
        ? `${period.year}-${period.month}` 
        : `${period.year}`;
    
    // إنشاء بيانات التقرير
    const reportData = honorBoard.map(entry => ({
      'الترتيب': entry.rank,
      'المراقب': entry.observerName,
      'المنطقة': entry.regionName,
      'النقاط الإجمالية': entry.totalPoints,
      'عدد الزيارات': entry.visitsCount,
      'عدد المخالفات': entry.violationsCount,
      'عدد الإنذارات': entry.warningsCount,
      'نقاط المشرف': entry.supervisorPoints,
      'التقييم': entry.evaluation ? getGradeLabel(entry.evaluation.grade) : '-',
    }));

    // إضافة ملخص الإحصائيات
    const summaryData = [
      { 'البيان': 'نوع التقرير', 'القيمة': viewType === 'weekly' ? 'أسبوعي' : viewType === 'monthly' ? 'شهري' : viewType === 'quarterly' ? 'ربع سنوي' : 'سنوي' },
      { 'البيان': 'الفترة', 'القيمة': periodLabel },
      { 'البيان': 'إجمالي الزيارات', 'القيمة': totalVisits },
      { 'البيان': 'إجمالي المخالفات', 'القيمة': totalViolations },
      { 'البيان': 'إجمالي الإنذارات', 'القيمة': totalWarnings },
      { 'البيان': 'نسبة الالتزام', 'القيمة': `${totalVisits > 0 ? Math.round(((totalVisits - totalViolations) / totalVisits) * 100) : 0}%` },
    ];

    // إنشاء محتوى CSV
    let csvContent = '\uFEFF'; // BOM for Arabic
    
    // إضافة الملخص
    csvContent += 'ملخص الإحصائيات\n';
    csvContent += 'البيان,القيمة\n';
    summaryData.forEach(row => {
      csvContent += `${row['البيان']},${row['القيمة']}\n`;
    });
    
    csvContent += '\nتفاصيل المراقبين\n';
    if (reportData.length > 0) {
      const headers = Object.keys(reportData[0]);
      csvContent += headers.join(',') + '\n';
      reportData.forEach(row => {
        csvContent += headers.map(h => row[h as keyof typeof row]).join(',') + '\n';
      });
    } else {
      csvContent += 'لا توجد بيانات\n';
    }

    // تحميل الملف
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_الإحصائيات_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGradeLabel = (grade: string): string => {
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

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">الإحصائيات التنفيذية</h1>
        <p className="text-gray-400">تقارير وتحليلات شاملة لأداء مراقبي الجودة</p>
      </div>

      {/* Period Selection */}
      <div className="card-custom mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium">نوع التقرير:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'weekly', label: 'أسبوعي' },
              { id: 'monthly', label: 'شهري' },
              { id: 'quarterly', label: 'ربع سنوي' },
              { id: 'yearly', label: 'سنوي' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setViewType(type.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewType === type.id 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">السنة</label>
            <select
              value={period.year}
              onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}
              className="input-custom w-full"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {(viewType === 'weekly' || viewType === 'monthly') && (
            <div>
              <label className="block text-gray-400 mb-2 text-sm">الشهر</label>
              <select
                value={period.month}
                onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}
                className="input-custom w-full"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}
          {viewType === 'weekly' && (
            <div>
              <label className="block text-gray-400 mb-2 text-sm">الأسبوع</label>
              <select
                value={period.week}
                onChange={(e) => setPeriod({ ...period, week: Number(e.target.value) })}
                className="input-custom w-full"
              >
                {weeks.map(w => (
                  <option key={w} value={w}>الأسبوع {w}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <TrendingUp className="w-8 h-8 text-teal-400 mb-3" />
          <h3 className="text-gray-400 text-sm mb-1">إجمالي الزيارات</h3>
          <p className="text-3xl font-bold text-white">{totalVisits}</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="w-8 h-8 text-orange-400 mb-3" />
          <h3 className="text-gray-400 text-sm mb-1">إجمالي المخالفات</h3>
          <p className="text-3xl font-bold text-white">{totalViolations}</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="w-8 h-8 text-red-400 mb-3" />
          <h3 className="text-gray-400 text-sm mb-1">إجمالي الإنذارات</h3>
          <p className="text-3xl font-bold text-white">{totalWarnings}</p>
        </div>
        <div className="stat-card">
          <Calendar className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="text-gray-400 text-sm mb-1">نسبة الالتزام</h3>
          <p className="text-3xl font-bold text-white">
            {totalVisits > 0 ? Math.round(((totalVisits - totalViolations) / totalVisits) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visits Chart */}
        <div className="card-custom">
          <h3 className="text-white font-bold text-lg mb-4">الزيارات والمخالفات</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0e3144', 
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="visits" fill="#14b8a6" name="الزيارات" />
                <Bar dataKey="violations" fill="#f97316" name="المخالفات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grades Distribution */}
        <div className="card-custom">
          <h3 className="text-white font-bold text-lg mb-4">توزيع التقييمات</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0e3144', 
                    border: '1px solid #ffffff20',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {gradesData.map((grade) => (
              <div key={grade.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: grade.color }}
                />
                <span className="text-gray-400 text-sm">{grade.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card-custom">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">أفضل المؤدين</h3>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير إلى Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right p-4 text-gray-400 font-medium">الترتيب</th>
                <th className="text-right p-4 text-gray-400 font-medium">المراقب</th>
                <th className="text-right p-4 text-gray-400 font-medium">المنطقة</th>
                <th className="text-center p-4 text-gray-400 font-medium">النقاط</th>
                <th className="text-center p-4 text-gray-400 font-medium">الزيارات</th>
                <th className="text-center p-4 text-gray-400 font-medium">المخالفات</th>
              </tr>
            </thead>
            <tbody>
              {honorBoard.slice(0, 5).map((entry) => (
                <tr key={entry.observerId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <span className={`rank-badge ${
                      entry.rank === 1 ? 'rank-1' : 
                      entry.rank === 2 ? 'rank-2' : 
                      entry.rank === 3 ? 'rank-3' : 'rank-other'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">{entry.observerName}</td>
                  <td className="p-4 text-gray-400">{entry.regionName}</td>
                  <td className="p-4 text-center">
                    <span className="text-teal-400 font-bold text-lg">{entry.totalPoints}</span>
                  </td>
                  <td className="p-4 text-center text-gray-400">{entry.visitsCount}</td>
                  <td className="p-4 text-center text-gray-400">{entry.violationsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
