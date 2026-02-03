import { useState } from 'react';
import type { ImprovementItem } from '@/types';
import { observers, getObserverName, getRegionName } from '@/data/mockData';
import { AlertTriangle, Edit, CheckCircle, Calendar, MapPin, FileText } from 'lucide-react';

interface ImprovementBasketProps {
  improvements: ImprovementItem[];
  updateImprovementPlan: (id: string, plan: string) => void;
  stats: { observerId: string; week: number; month: number; year: number; violationsCount: number }[];
}

export function ImprovementBasket({ improvements, updateImprovementPlan, stats }: ImprovementBasketProps) {
  const [selectedItem, setSelectedItem] = useState<ImprovementItem | null>(null);
  const [planText, setPlanText] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);

  // تحديد المراقبين الذين يحتاجون للتحسين (أكثر من 2 مخالفة)
  const observersNeedingImprovement = stats
    .filter(stat => stat.violationsCount > 2)
    .map(stat => {
      const observer = observers.find(o => o.id === stat.observerId);
      const existingImprovement = improvements.find(
        imp => imp.observerId === stat.observerId && 
               imp.week === stat.week && 
               imp.month === stat.month && 
               imp.year === stat.year
      );
      return {
        ...stat,
        observerName: getObserverName(stat.observerId),
        regionName: getRegionName(observer?.regionId || ''),
        improvement: existingImprovement,
      };
    });

  const handleOpenPlan = (item: typeof observersNeedingImprovement[0]) => {
    setSelectedItem(item.improvement || {
      id: 'new',
      observerId: item.observerId,
      week: item.week,
      month: item.month,
      year: item.year,
      reason: `ارتفاع نسبة المخالفات (${item.violationsCount} مخالفات)`,
      plan: '',
      planStatus: 'draft',
      submittedBy: '2',
    });
    setPlanText(item.improvement?.plan || '');
    setShowPlanModal(true);
  };

  const handleSubmitPlan = () => {
    if (selectedItem && planText.trim()) {
      if (selectedItem.id !== 'new') {
        updateImprovementPlan(selectedItem.id, planText);
      }
      setShowPlanModal(false);
      setSelectedItem(null);
      setPlanText('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-400">مسودة</span>;
      case 'submitted':
        return <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400">مقدم للمراجعة</span>;
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400">معتمد</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">سلة التحسين</h1>
        <p className="text-gray-400">مراقبون يحتاجون إلى خطط تحسين</p>
      </div>

      {/* Alert Banner */}
      <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
        <p className="text-orange-400">
          يتم إضافة المراقبين تلقائياً لسلة التحسين عند تجاوز عدد المخالفات (2) في الأسبوع
        </p>
      </div>

      {/* Improvement List */}
      <div className="space-y-4">
        {observersNeedingImprovement.map((item, index) => (
          <div key={index} className="card-custom">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.observerName}</h3>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.regionName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.year}/{item.month} - أسبوع {item.week}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                      {item.violationsCount} مخالفات
                    </span>
                    {item.improvement && getStatusBadge(item.improvement.planStatus)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleOpenPlan(item)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {item.improvement?.plan ? 'تعديل الخطة' : 'كتابة خطة'}
              </button>
            </div>

            {item.improvement?.plan && (
              <div className="mt-4 p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  خطة التحسين:
                </p>
                <p className="text-white">{item.improvement.plan}</p>
              </div>
            )}
          </div>
        ))}

        {observersNeedingImprovement.length === 0 && (
          <div className="text-center py-12 card-custom">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">لا يوجد مراقبين في سلة التحسين</h3>
            <p className="text-gray-400">جميع المراقبين يحققون الأداء المطلوب</p>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      {showPlanModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">خطة التحسين</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">المراقب</p>
                <p className="font-medium text-gray-900">{getObserverName(selectedItem.observerId)}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">السبب</p>
                <p className="text-gray-900">{selectedItem.reason}</p>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">
                  <FileText className="w-4 h-4 inline ml-2" />
                  خطة التحسين المقترحة
                </label>
                <textarea
                  value={planText}
                  onChange={(e) => setPlanText(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-32"
                  placeholder="اكتب خطة التحسين المقترحة للمراقب..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitPlan}
                disabled={!planText.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                حفظ الخطة
              </button>
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
