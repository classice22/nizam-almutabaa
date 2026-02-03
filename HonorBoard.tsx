import { useState, useMemo } from 'react';
import type { TimePeriod, WeeklyStats, Evaluation } from '@/types';
import { Trophy, Medal, Award, Star, Calendar, Filter, Info, TrendingUp } from 'lucide-react';
import { pointsSystem, observers, getRegionName } from '@/data/mockData';

interface HonorBoardProps {
  stats: WeeklyStats[];
  evaluations: Evaluation[];
}

export function HonorBoard({ stats, evaluations }: HonorBoardProps) {
  const [period, setPeriod] = useState<TimePeriod>({ week: 1, month: 1, year: 2026 });
  const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  // حساب لوحة الشرف مباشرة بدلاً من استخدام hook
  const honorBoard = useMemo(() => {
    const periodStats = stats.filter(s => 
      s.month === period.month && 
      s.year === period.year &&
      (period.week === undefined || s.week === period.week)
    );
    const periodEvals = evaluations.filter(e => 
      e.month === period.month && 
      e.year === period.year &&
      (period.week === undefined || e.week === period.week)
    );
    
    // الإحصائيات المعتمدة وغير الإجازة
    const approvedStats = periodStats.filter(s => s.status === 'approved' && !s.isOnLeave);
    const observersWithApprovedStats = new Set(approvedStats.map(s => s.observerId));
    
    // المراقبين الذين لديهم تقييمات
    const observersWithEvaluations = new Set(periodEvals.map(e => e.observerId));
    
    // لوحة الشرف تتطلب إحصائية معتمدة + تقييم
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
      
      // حساب النقاط
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
    
    // ترتيب حسب النقاط تنازلياً
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // تحديث الترتيب
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries;
  }, [stats, evaluations, period]);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30';
      default:
        return 'bg-white/5 border-white/10';
    }
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

  const getGradeColor = (grade: string): string => {
    const colors: Record<string, string> = {
      excellent: 'text-emerald-400',
      very_good: 'text-teal-400',
      acceptable: 'text-yellow-400',
      needs_improvement: 'text-orange-400',
      neutral: 'text-gray-400',
      on_leave: 'text-blue-400',
    };
    return colors[grade] || 'text-gray-400';
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">لوحة الشرف</h1>
        <p className="text-gray-400">تكريم أفضل المؤدين في فريق مراقبي الجودة</p>
      </div>

      {/* Period Selection */}
      <div className="card-custom mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium">الفترة:</span>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">
              <Calendar className="w-4 h-4 inline ml-2" />
              السنة
            </label>
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
              <label className="block text-gray-400 mb-2 text-sm">
                <Calendar className="w-4 h-4 inline ml-2" />
                الشهر
              </label>
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
              <label className="block text-gray-400 mb-2 text-sm">
                <Calendar className="w-4 h-4 inline ml-2" />
                الأسبوع
              </label>
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

      {/* Top 3 Podium */}
      {honorBoard.length >= 3 && (
        <div className="flex justify-center items-end gap-4 mb-12">
          {/* Second Place */}
          <div className="text-center">
            <div className="w-24 h-32 rounded-t-lg bg-gradient-to-b from-gray-300 to-gray-400 flex flex-col items-center justify-center p-4">
              <Medal className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-gray-800 font-bold text-sm text-center leading-tight">
                {honorBoard[1]?.observerName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-gray-700 text-xs mt-1">{honorBoard[1]?.totalPoints} نقطة</p>
            </div>
            <div className="bg-gray-700 text-white py-2 rounded-b-lg font-bold">2</div>
          </div>

          {/* First Place */}
          <div className="text-center">
            <div className="w-28 h-40 rounded-t-lg bg-gradient-to-b from-yellow-300 to-yellow-500 flex flex-col items-center justify-center p-4">
              <Trophy className="w-10 h-10 text-yellow-800 mb-2" />
              <p className="text-yellow-900 font-bold text-sm text-center leading-tight">
                {honorBoard[0]?.observerName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-yellow-800 text-xs mt-1">{honorBoard[0]?.totalPoints} نقطة</p>
            </div>
            <div className="bg-yellow-600 text-white py-2 rounded-b-lg font-bold">1</div>
          </div>

          {/* Third Place */}
          <div className="text-center">
            <div className="w-24 h-28 rounded-t-lg bg-gradient-to-b from-amber-500 to-amber-700 flex flex-col items-center justify-center p-4">
              <Award className="w-8 h-8 text-amber-100 mb-2" />
              <p className="text-amber-100 font-bold text-sm text-center leading-tight">
                {honorBoard[2]?.observerName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-amber-200 text-xs mt-1">{honorBoard[2]?.totalPoints} نقطة</p>
            </div>
            <div className="bg-amber-800 text-white py-2 rounded-b-lg font-bold">3</div>
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="card-custom mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">الترتيب الكامل</h3>
          <button
            onClick={() => setShowPointsInfo(!showPointsInfo)}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm"
          >
            <Info className="w-4 h-4" />
            نظام النقاط
          </button>
        </div>

        {/* Points System Info */}
        {showPointsInfo && (
          <div className="mb-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <h4 className="text-teal-400 font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              نظام النقاط الإيجابي
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-teal-500/10 text-center">
                <p className="text-teal-400 font-bold text-xl">+{pointsSystem.visits.points}</p>
                <p className="text-gray-400">نقطة لكل زيارة</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <p className="text-orange-400 font-bold text-xl">{pointsSystem.violations.points}</p>
                <p className="text-gray-400">نقاط للمخالفة</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center">
                <p className="text-red-400 font-bold text-xl">{pointsSystem.warnings.points}</p>
                <p className="text-gray-400">نقاط للإنذار</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                <p className="text-emerald-400 font-bold text-xl">+0-10</p>
                <p className="text-gray-400">نقاط المشرف</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">
              النظام مصمم لتعزيز الأداء الإيجابي وتشجيع المراقبين على التحسين المستمر
            </p>
          </div>
        )}

        <div className="space-y-3">
          {honorBoard.map((entry) => (
            <div 
              key={entry.observerId} 
              className={`honor-board-row ${entry.rank <= 3 ? 'top-3' : ''} ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className={`rank-badge ${
                  entry.rank === 1 ? 'rank-1' : 
                  entry.rank === 2 ? 'rank-2' : 
                  entry.rank === 3 ? 'rank-3' : 'rank-other'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <p className="text-white font-bold">{entry.observerName}</p>
                  <p className="text-gray-400 text-sm">{entry.regionName}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-teal-400 font-bold text-lg">{entry.visitsCount}</p>
                  <p className="text-gray-400 text-xs">زيارات</p>
                </div>
                <div className="text-center">
                  <p className="text-orange-400 font-bold text-lg">{entry.violationsCount}</p>
                  <p className="text-gray-400 text-xs">مخالفات</p>
                </div>
                <div className="text-center">
                  <p className="text-red-400 font-bold text-lg">{entry.warningsCount}</p>
                  <p className="text-gray-400 text-xs">إنذارات</p>
                </div>
                {entry.evaluation && (
                  <div className="text-center">
                    <p className={`font-bold text-sm ${getGradeColor(entry.evaluation.grade)}`}>
                      {getGradeLabel(entry.evaluation.grade)}
                    </p>
                    <p className="text-gray-400 text-xs">التقييم</p>
                  </div>
                )}
                <div className="text-center px-4 py-2 rounded-lg bg-teal-500/20">
                  <p className="text-teal-400 font-bold text-2xl">{entry.totalPoints}</p>
                  <p className="text-gray-400 text-xs">نقطة</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {honorBoard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد بيانات للفترة المحددة</p>
          </div>
        )}
      </div>

      {/* Grades Info */}
      <div className="card-custom">
        <h3 className="text-white font-bold text-lg mb-4">درجات التقييم</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 text-center">
            <p className="text-emerald-400 font-bold text-lg">ممتاز</p>
            <p className="text-emerald-400 font-bold text-2xl">+10</p>
            <p className="text-gray-400 text-xs">أداء استثنائي</p>
          </div>
          <div className="p-4 rounded-lg bg-teal-500/10 text-center">
            <p className="text-teal-400 font-bold text-lg">جيد جداً</p>
            <p className="text-teal-400 font-bold text-2xl">+8</p>
            <p className="text-gray-400 text-xs">أداء متميز</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 text-center">
            <p className="text-yellow-400 font-bold text-lg">مقبول</p>
            <p className="text-yellow-400 font-bold text-2xl">+5</p>
            <p className="text-gray-400 text-xs">يلبي المتطلبات</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 text-center">
            <p className="text-orange-400 font-bold text-lg">يحتاج تحسين</p>
            <p className="text-orange-400 font-bold text-2xl">+2</p>
            <p className="text-gray-400 text-xs">فرصة للتطوير</p>
          </div>
        </div>
      </div>
    </div>
  );
}
