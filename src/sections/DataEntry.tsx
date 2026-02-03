import { useState, useMemo } from 'react';
import { observers, regions, pointsSystem } from '@/data/mockData';
import type { WeeklyStats } from '@/types';
import { Save, Calendar, MapPin, User, AlertCircle, CheckCircle, Edit2, RotateCcw, Ban } from 'lucide-react';

interface DataEntryProps {
  stats: WeeklyStats[];
  addStat: (stat: Omit<WeeklyStats, 'id' | 'entryDate'>) => void;
  updateStat: (id: string, updates: Partial<WeeklyStats>) => void;
  currentUserId: string;
}

export function DataEntry({ stats, addStat, updateStat, currentUserId }: DataEntryProps) {
  const [selectedObserver, setSelectedObserver] = useState('');
  const [week, setWeek] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2026);
  const [visitsCount, setVisitsCount] = useState(0);
  const [violationsCount, setViolationsCount] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editingStat, setEditingStat] = useState<WeeklyStats | null>(null);

  // الإحصائيات المعلقة والمعادة للتعديل
  const myStats = stats.filter(s => s.enteredBy === currentUserId);
  const pendingStats = myStats.filter(s => s.status === 'pending');
  const returnedStats = myStats.filter(s => s.status === 'returned');

  // التحقق مما إذا كان المراقب مسجل له إحصائية في هذا الأسبوع
  const isObserverRegistered = useMemo(() => {
    if (!selectedObserver || editingStat) return false;
    return stats.some(s => 
      s.observerId === selectedObserver && 
      s.week === week && 
      s.month === month && 
      s.year === year
    );
  }, [selectedObserver, week, month, year, stats, editingStat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedObserver) {
      setError('الرجاء اختيار المراقب');
      return;
    }

    // التحقق من عدم التسجيل المكرر
    if (isObserverRegistered && !editingStat) {
      setError('تم تسجيل إحصائية لهذا المراقب في هذا الأسبوع مسبقاً');
      return;
    }

    // التحقق من صحة البيانات
    if (!isOnLeave) {
      if (visitsCount < 0 || violationsCount < 0 || warningsCount < 0) {
        setError('لا يمكن إدخال قيم سالبة');
        return;
      }
      
      if (violationsCount > visitsCount) {
        setError('عدد المخالفات لا يمكن أن يتجاوز عدد الزيارات');
        return;
      }
      
      if (warningsCount > visitsCount) {
        setError('عدد الإنذارات لا يمكن أن يتجاوز عدد الزيارات');
        return;
      }
    }

    try {
      if (editingStat) {
        // تعديل إحصائية موجودة
        updateStat(editingStat.id, {
          visitsCount: isOnLeave ? 0 : visitsCount,
          violationsCount: isOnLeave ? 0 : violationsCount,
          warningsCount: isOnLeave ? 0 : warningsCount,
          notes: isOnLeave ? 'المراقب في إجازة' : notes,
          isOnLeave,
          status: 'pending',
        });
        setEditingStat(null);
      } else {
        // إضافة إحصائية جديدة
        addStat({
          observerId: selectedObserver,
          week,
          month,
          year,
          visitsCount: isOnLeave ? 0 : visitsCount,
          violationsCount: isOnLeave ? 0 : violationsCount,
          warningsCount: isOnLeave ? 0 : warningsCount,
          notes: isOnLeave ? 'المراقب في إجازة' : notes,
          enteredBy: currentUserId,
          status: 'pending',
          isOnLeave,
        });
      }

      // Reset form
      setSelectedObserver('');
      setVisitsCount(0);
      setViolationsCount(0);
      setWarningsCount(0);
      setNotes('');
      setIsOnLeave(false);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (stat: WeeklyStats) => {
    setEditingStat(stat);
    setSelectedObserver(stat.observerId);
    setWeek(stat.week);
    setMonth(stat.month);
    setYear(stat.year);
    setVisitsCount(stat.visitsCount);
    setViolationsCount(stat.violationsCount);
    setWarningsCount(stat.warningsCount);
    setNotes(stat.notes);
    setIsOnLeave(stat.isOnLeave);
  };

  const handleCancelEdit = () => {
    setEditingStat(null);
    setSelectedObserver('');
    setVisitsCount(0);
    setViolationsCount(0);
    setWarningsCount(0);
    setNotes('');
    setIsOnLeave(false);
  };

  const selectedObserverData = observers.find(o => o.id === selectedObserver);
  const selectedRegion = selectedObserverData ? regions.find(r => r.id === selectedObserverData.regionId) : null;

  // Generate years from 2024 to 2040
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

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">إدخال إحصائيات الأداء</h1>
        <p className="text-gray-400">تسجيل بيانات أداء المراقبين للفترة المحددة</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span>{editingStat ? 'تم تحديث البيانات بنجاح' : 'تم حفظ البيانات بنجاح'}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Returned Stats Alert */}
      {returnedStats.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <h3 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            إحصائيات معادة للتعديل ({returnedStats.length})
          </h3>
          <div className="space-y-2">
            {returnedStats.map(stat => (
              <div key={stat.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div>
                  <span className="text-white">{observers.find(o => o.id === stat.observerId)?.name}</span>
                  <span className="text-gray-400 text-sm mr-2">- {stat.year}/{stat.month} أسبوع {stat.week}</span>
                </div>
                <button
                  onClick={() => handleEdit(stat)}
                  className="px-3 py-1 rounded bg-orange-500 text-white text-sm flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  تعديل
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card-custom space-y-6">
            {editingStat && (
              <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-between">
                <span className="text-blue-400">تعديل إحصائية موجودة</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  إلغاء التعديل
                </button>
              </div>
            )}

            {/* Time Period Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white mb-2 font-medium">
                  <Calendar className="w-4 h-4 inline ml-2" />
                  السنة
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="input-custom w-full"
                  disabled={!!editingStat}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white mb-2 font-medium">
                  <Calendar className="w-4 h-4 inline ml-2" />
                  الشهر
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="input-custom w-full"
                  disabled={!!editingStat}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white mb-2 font-medium">
                  <Calendar className="w-4 h-4 inline ml-2" />
                  الأسبوع
                </label>
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="input-custom w-full"
                  disabled={!!editingStat}
                >
                  {weeks.map(w => (
                    <option key={w} value={w}>الأسبوع {w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observer Selection */}
            <div>
              <label className="block text-white mb-2 font-medium">
                <User className="w-4 h-4 inline ml-2" />
                المراقب
              </label>
              <select
                value={selectedObserver}
                onChange={(e) => {
                  setSelectedObserver(e.target.value);
                  setIsOnLeave(false);
                }}
                className="input-custom w-full"
                required
                disabled={!!editingStat}
              >
                <option value="">اختر المراقب</option>
                {regions.map(region => (
                  <optgroup key={region.id} label={region.name}>
                    {observers
                      .filter(o => o.regionId === region.id)
                      .map(observer => (
                        <option key={observer.id} value={observer.id}>
                          {observer.name} {observer.status === 'on_leave' ? '(في إجازة)' : ''}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              
              {/* Duplicate Warning */}
              {isObserverRegistered && !editingStat && (
                <div className="mt-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">
                    تم تسجيل إحصائية لهذا المراقب في هذا الأسبوع مسبقاً
                  </span>
                </div>
              )}
            </div>

            {/* On Leave Checkbox */}
            {!isObserverRegistered && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnLeave}
                    onChange={(e) => setIsOnLeave(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-blue-400 font-medium">المراقب في إجازة (معفى من التقييم)</span>
                </label>
                <p className="text-gray-400 text-sm mt-2 mr-8">
                  عند تحديد هذا الخيار، سيتم تسجيل حالة محايدة للمراقب ولا يتم احتسابه في الإحصائيات
                </p>
              </div>
            )}

            {/* Stats Inputs - Hidden when on leave or duplicate */}
            {!isOnLeave && !isObserverRegistered && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-medium">عدد الزيارات</label>
                    <input
                      type="number"
                      min="0"
                      value={visitsCount}
                      onChange={(e) => setVisitsCount(Number(e.target.value))}
                      className="input-custom w-full text-center"
                    />
                    <p className="text-gray-500 text-xs mt-1 text-center">+{pointsSystem.visits.points} نقطة</p>
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">عدد المخالفات</label>
                    <input
                      type="number"
                      min="0"
                      value={violationsCount}
                      onChange={(e) => setViolationsCount(Number(e.target.value))}
                      className="input-custom w-full text-center"
                    />
                    <p className="text-gray-500 text-xs mt-1 text-center">+{pointsSystem.violations.points} نقاط</p>
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">عدد الإنذارات</label>
                    <input
                      type="number"
                      min="0"
                      value={warningsCount}
                      onChange={(e) => setWarningsCount(Number(e.target.value))}
                      className="input-custom w-full text-center"
                    />
                    <p className="text-gray-500 text-xs mt-1 text-center">+{pointsSystem.warnings.points} نقاط</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white mb-2 font-medium">ملاحظات</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-custom w-full h-24 resize-none"
                    placeholder="أدخل أي ملاحظات إضافية..."
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedObserver || (isObserverRegistered && !editingStat)}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {editingStat ? 'تحديث البيانات' : (isOnLeave ? 'تسجيل حالة الإجازة' : 'حفظ البيانات')}
            </button>
          </form>

          {/* Pending Stats List */}
          {pendingStats.length > 0 && (
            <div className="card-custom mt-6">
              <h3 className="text-white font-bold mb-4">إحصائيات معلقة ({pendingStats.length})</h3>
              <div className="space-y-2">
                {pendingStats.map(stat => (
                  <div key={stat.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                    <div>
                      <span className="text-white">{observers.find(o => o.id === stat.observerId)?.name}</span>
                      <span className="text-gray-400 text-sm mr-2">- {stat.year}/{stat.month} أسبوع {stat.week}</span>
                      {!stat.isOnLeave && (
                        <span className="text-teal-400 text-sm mr-2">({stat.visitsCount} زيارات)</span>
                      )}
                      {stat.isOnLeave && (
                        <span className="text-blue-400 text-sm mr-2">(في إجازة)</span>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                      معلق
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="card-custom sticky top-6">
            <h3 className="text-white font-bold text-lg mb-4">معاينة البيانات</h3>
            
            {selectedObserver ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">المراقب</p>
                  <p className="text-white font-medium">{selectedObserverData?.name}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">المنطقة</p>
                  <p className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    {selectedRegion?.name}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">الفترة</p>
                  <p className="text-white font-medium">
                    {months.find(m => m.value === month)?.label} {year} - أسبوع {week}
                  </p>
                </div>

                {isOnLeave ? (
                  <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 text-center">
                    <p className="text-blue-400 font-bold text-lg">في إجازة</p>
                    <p className="text-gray-400 text-sm">معفى من التقييم والإحصائيات</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-teal-500/10 text-center">
                      <p className="text-teal-400 text-2xl font-bold">{visitsCount}</p>
                      <p className="text-gray-400 text-xs">زيارات</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                      <p className="text-orange-400 text-2xl font-bold">{violationsCount}</p>
                      <p className="text-gray-400 text-xs">مخالفات</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 text-center">
                      <p className="text-red-400 text-2xl font-bold">{warningsCount}</p>
                      <p className="text-gray-400 text-xs">إنذارات</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">اختر مراقباً لعرض المعاينة</p>
              </div>
            )}
          </div>

          {/* Points System Info */}
          <div className="card-custom mt-6">
            <h3 className="text-white font-bold text-lg mb-4">نظام النقاط الإيجابي</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 rounded bg-teal-500/10">
                <span className="text-gray-400">الزيارات</span>
                <span className="text-teal-400 font-bold">+{pointsSystem.visits.points}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-orange-500/10">
                <span className="text-gray-400">المخالفات</span>
                <span className="text-orange-400 font-bold">+{pointsSystem.violations.points}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-red-500/10">
                <span className="text-gray-400">الإنذارات</span>
                <span className="text-red-400 font-bold">+{pointsSystem.warnings.points}</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              جميع النقاط إيجابية - رصد المخالفات والإنذارات يعزز جودة العمل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
