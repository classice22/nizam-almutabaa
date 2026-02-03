import { useState } from 'react';
import type { EvaluationGrade, WeeklyStats, Evaluation } from '@/types';
import { observers, getObserverName, getRegionName } from '@/data/mockData';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Star,
  AlertTriangle,
  Search,
  History,
  Info
} from 'lucide-react';

interface SupervisorPanelProps {
  stats: WeeklyStats[];
  evaluations: Evaluation[];
  updateStat: (id: string, updates: Partial<WeeklyStats>) => void;
  deleteStat: (id: string) => void;
  addEvaluation: (evaluation: any) => void;
  addImprovement: (item: any) => void;
  editEvaluation: (id: string, updates: Partial<Evaluation>, reason: string, editedBy: string) => void;
  deleteEvaluation: (id: string) => void;
  getEvaluation: (observerId: string, period: { week: number; month: number; year: number }) => Evaluation | undefined;
}

export function SupervisorPanel({ 
  stats, 
  evaluations,
  updateStat, 
  deleteStat,
  addEvaluation, 
  addImprovement, 
  editEvaluation,
  deleteEvaluation,
  getEvaluation 
}: SupervisorPanelProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'approved' | 'evaluations' | 'observers'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStat, setSelectedStat] = useState<WeeklyStats | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEditStatModal, setShowEditStatModal] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [evaluationData, setEvaluationData] = useState({
    grade: 'very_good' as EvaluationGrade,
    supervisorPoints: 5,
    notes: '',
  });
  const [statEditData, setStatEditData] = useState({
    visitsCount: 0,
    violationsCount: 0,
    warningsCount: 0,
    notes: '',
  });

  // Pending approvals
  const pendingStats = stats.filter(s => s.status === 'pending');

  // Approved stats (with or without evaluation) - للتعديل بعد الاعتماد
  const approvedStats = stats.filter(s => s.status === 'approved' && !s.isOnLeave);

  // Approved stats without evaluation
  const approvedStatsWithoutEval = approvedStats.filter(s => {
    const eval_ = getEvaluation(s.observerId, { week: s.week, month: s.month, year: s.year });
    return !eval_;
  });

  // Filtered observers
  const filteredObservers = observers.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (statId: string) => {
    updateStat(statId, { status: 'approved' });
  };

  const handleReject = (statId: string) => {
    updateStat(statId, { status: 'rejected' });
  };

  const handleReturn = (statId: string) => {
    updateStat(statId, { status: 'returned' });
  };

  const handleEvaluate = (stat: WeeklyStats) => {
    setSelectedStat(stat);
    setEvaluationData({
      grade: 'very_good',
      supervisorPoints: 5,
      notes: '',
    });
    setShowEvalModal(true);
  };

  const handleEditEvaluation = (eval_: Evaluation) => {
    setSelectedEvaluation(eval_);
    setEvaluationData({
      grade: eval_.grade,
      supervisorPoints: eval_.supervisorPoints,
      notes: eval_.notes,
    });
    setEditReason('');
    setShowEditModal(true);
  };

  const handleDeleteEvaluation = (evalId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      deleteEvaluation(evalId);
    }
  };

  const handleEditStat = (stat: WeeklyStats) => {
    setSelectedStat(stat);
    setStatEditData({
      visitsCount: stat.visitsCount,
      violationsCount: stat.violationsCount,
      warningsCount: stat.warningsCount,
      notes: stat.notes,
    });
    setShowEditStatModal(true);
  };

  const submitStatEdit = () => {
    if (selectedStat) {
      updateStat(selectedStat.id, {
        visitsCount: statEditData.visitsCount,
        violationsCount: statEditData.violationsCount,
        warningsCount: statEditData.warningsCount,
        notes: statEditData.notes,
      });
      setShowEditStatModal(false);
      setSelectedStat(null);
    }
  };

  const handleDeleteStat = (statId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الإحصائية؟')) {
      deleteStat(statId);
    }
  };

  const submitEvaluation = () => {
    if (selectedStat) {
      addEvaluation({
        observerId: selectedStat.observerId,
        week: selectedStat.week,
        month: selectedStat.month,
        year: selectedStat.year,
        grade: evaluationData.grade,
        supervisorPoints: evaluationData.supervisorPoints,
        notes: evaluationData.notes,
        evaluatedBy: '3',
      });

      // If needs improvement, add to improvement basket
      if (evaluationData.grade === 'needs_improvement') {
        addImprovement({
          observerId: selectedStat.observerId,
          week: selectedStat.week,
          month: selectedStat.month,
          year: selectedStat.year,
          reason: 'تقييم يحتاج تحسين من المشرف',
          plan: '',
          planStatus: 'draft',
          submittedBy: '3',
        });
      }

      setShowEvalModal(false);
      setSelectedStat(null);
      setEvaluationData({ grade: 'very_good', supervisorPoints: 5, notes: '' });
    }
  };

  const submitEditEvaluation = () => {
    if (selectedEvaluation && editReason.trim()) {
      editEvaluation(
        selectedEvaluation.id,
        {
          grade: evaluationData.grade,
          supervisorPoints: evaluationData.supervisorPoints,
          notes: evaluationData.notes,
        },
        editReason,
        '3'
      );
      setShowEditModal(false);
      setSelectedEvaluation(null);
      setEditReason('');
    }
  };

  const handleAddToImprovement = (observerId: string, stat: WeeklyStats) => {
    addImprovement({
      observerId,
      week: stat.week,
      month: stat.month,
      year: stat.year,
      reason: 'قرار من المشرف - أداء دون المستوى المطلوب',
      plan: '',
      planStatus: 'draft',
      submittedBy: '3',
    });
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
        <h1 className="text-2xl font-bold text-white mb-2">لوحة تحكم المشرف</h1>
        <p className="text-gray-400">إدارة الاعتمادات والتقييمات والمراقبين</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'approvals' 
              ? 'bg-teal-500 text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline ml-2" />
          معلق ({pendingStats.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'approved' 
              ? 'bg-teal-500 text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Edit2 className="w-4 h-4 inline ml-2" />
          معتمد ({approvedStats.length})
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'evaluations' 
              ? 'bg-teal-500 text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Star className="w-4 h-4 inline ml-2" />
          تقييم ({approvedStatsWithoutEval.length})
        </button>
        <button
          onClick={() => setActiveTab('observers')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'observers' 
              ? 'bg-teal-500 text-white' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4 inline ml-2" />
          المراقبين
        </button>
      </div>

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingStats.length === 0 ? (
            <div className="text-center py-12 card-custom">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">لا توجد اعتمادات معلقة</h3>
              <p className="text-gray-400">جميع الإحصائيات تم اعتمادها</p>
            </div>
          ) : (
            pendingStats.map((stat) => (
              <div key={stat.id} className="card-custom">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">
                        {getObserverName(stat.observerId)}
                      </h3>
                      {stat.isOnLeave && (
                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                          في إجازة
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {stat.year}/{stat.month} - أسبوع {stat.week}
                    </p>
                    {!stat.isOnLeave && (
                      <div className="flex gap-4">
                        <span className="text-teal-400">{stat.visitsCount} زيارات</span>
                        <span className="text-orange-400">{stat.violationsCount} مخالفات</span>
                        <span className="text-red-400">{stat.warningsCount} إنذارات</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(stat.id)}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      title="اعتماد"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    {!stat.isOnLeave && (
                      <>
                        <button
                          onClick={() => handleEvaluate(stat)}
                          className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                          title="تقييم"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAddToImprovement(stat.observerId, stat)}
                          className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                          title="إضافة لسلة التحسين"
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleReturn(stat.id)}
                      className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      title="إعادة للتعديل"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(stat.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      title="رفض"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved Stats Tab - تعديل الإحصائيات المعتمدة */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedStats.length === 0 ? (
            <div className="text-center py-12 card-custom">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">لا توجد إحصائيات معتمدة</h3>
              <p className="text-gray-400">يمكنك تعديل الإحصائيات المعتمدة من هنا</p>
            </div>
          ) : (
            approvedStats.map((stat) => (
              <div key={stat.id} className="card-custom">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-lg">
                        {getObserverName(stat.observerId)}
                      </h3>
                      <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        معتمد
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {stat.year}/{stat.month} - أسبوع {stat.week}
                    </p>
                    <div className="flex gap-4">
                      <span className="text-teal-400">{stat.visitsCount} زيارات</span>
                      <span className="text-orange-400">{stat.violationsCount} مخالفات</span>
                      <span className="text-red-400">{stat.warningsCount} إنذارات</span>
                    </div>
                    {stat.notes && (
                      <p className="text-gray-500 text-sm mt-2">ملاحظات: {stat.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStat(stat)}
                      className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                      title="تعديل الإحصائية"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStat(stat.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      title="حذف الإحصائية"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Evaluations Tab */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          {/* Existing Evaluations - فلترة التقييمات للمراقبين غير الإجازة */}
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg mb-4">التقييمات الحالية</h3>
            {(() => {
              // فلترة التقييمات للمراقبين غير الإجازة فقط
              const validEvaluations = evaluations.filter(e => {
                const relatedStat = stats.find(s => 
                  s.observerId === e.observerId && 
                  s.week === e.week && 
                  s.month === e.month && 
                  s.year === e.year
                );
                return !e.isEdited && relatedStat && !relatedStat.isOnLeave;
              });
              
              if (validEvaluations.length === 0) {
                return <p className="text-gray-400 text-center py-4">لا توجد تقييمات حالية</p>;
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validEvaluations.map((eval_) => (
                  <div key={eval_.id} className="card-custom">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-bold">{getObserverName(eval_.observerId)}</h4>
                        <p className="text-gray-400 text-sm">{eval_.year}/{eval_.month} - أسبوع {eval_.week}</p>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            eval_.grade === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                            eval_.grade === 'very_good' ? 'bg-teal-500/20 text-teal-400' :
                            eval_.grade === 'acceptable' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {getGradeLabel(eval_.grade)}
                          </span>
                        </div>
                        <p className="text-teal-400 text-sm mt-2">
                          نقاط المشرف: {eval_.supervisorPoints}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEvaluation(eval_)}
                          className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                          title="تعديل التقييم"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvaluation(eval_.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          title="حذف التقييم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {eval_.editHistory && eval_.editHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedEvaluation(eval_);
                              setShowHistoryModal(true);
                            }}
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            title="سجل التعديلات"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Pending Evaluations */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">في انتظار التقييم</h3>
            {approvedStatsWithoutEval.length === 0 ? (
              <p className="text-gray-400 text-center py-4">لا توجد إحصائيات في انتظار التقييم</p>
            ) : (
              <div className="space-y-4">
                {approvedStatsWithoutEval.map((stat) => (
                  <div key={stat.id} className="card-custom">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-bold">{getObserverName(stat.observerId)}</h4>
                        <p className="text-gray-400 text-sm">{stat.year}/{stat.month} - أسبوع {stat.week}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-teal-400">{stat.visitsCount} زيارات</span>
                          <span className="text-orange-400">{stat.violationsCount} مخالفات</span>
                          <span className="text-red-400">{stat.warningsCount} إنذارات</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEvaluate(stat)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        تقييم
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observers Tab */}
      {activeTab === 'observers' && (
        <div>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-custom w-full pr-10"
                placeholder="البحث باسم المراقب..."
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة مراقب
            </button>
          </div>

          {/* Observers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredObservers.map((observer) => (
              <div key={observer.id} className="card-custom">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-teal-400" />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-bold mb-1">{observer.name}</h3>
                <p className="text-gray-400 text-sm">{getRegionName(observer.regionId)}</p>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    observer.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {observer.status === 'active' ? 'نشط' : 'في إجازة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvalModal && selectedStat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">تقييم أداء المراقب</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">المراقب</p>
                <p className="font-medium text-gray-900">{getObserverName(selectedStat.observerId)}</p>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">درجة التقييم</label>
                <select
                  value={evaluationData.grade}
                  onChange={(e) => setEvaluationData({ ...evaluationData, grade: e.target.value as EvaluationGrade })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="excellent">ممتاز (+10 نقاط)</option>
                  <option value="very_good">جيد جداً (+8 نقاط)</option>
                  <option value="acceptable">مقبول (+5 نقاط)</option>
                  <option value="needs_improvement">يحتاج تحسين (+2 نقاط)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">نقاط المشرف (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationData.supervisorPoints}
                  onChange={(e) => setEvaluationData({ ...evaluationData, supervisorPoints: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">ملاحظات</label>
                <textarea
                  value={evaluationData.notes}
                  onChange={(e) => setEvaluationData({ ...evaluationData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-24"
                  placeholder="أدخل ملاحظات التقييم..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitEvaluation}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                حفظ التقييم
              </button>
              <button
                onClick={() => setShowEvalModal(false)}
                className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Evaluation Modal */}
      {showEditModal && selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">تعديل التقييم</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">المراقب</p>
                <p className="font-medium text-gray-900">{getObserverName(selectedEvaluation.observerId)}</p>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">درجة التقييم</label>
                <select
                  value={evaluationData.grade}
                  onChange={(e) => setEvaluationData({ ...evaluationData, grade: e.target.value as EvaluationGrade })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="excellent">ممتاز (+10 نقاط)</option>
                  <option value="very_good">جيد جداً (+8 نقاط)</option>
                  <option value="acceptable">مقبول (+5 نقاط)</option>
                  <option value="needs_improvement">يحتاج تحسين (+2 نقاط)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">نقاط المشرف (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={evaluationData.supervisorPoints}
                  onChange={(e) => setEvaluationData({ ...evaluationData, supervisorPoints: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">ملاحظات</label>
                <textarea
                  value={evaluationData.notes}
                  onChange={(e) => setEvaluationData({ ...evaluationData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-24"
                  placeholder="أدخل ملاحظات التقييم..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">
                  <Info className="w-4 h-4 inline ml-2" />
                  سبب التعديل <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-24"
                  placeholder="أدخل سبب تعديل التقييم..."
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitEditEvaluation}
                disabled={!editReason.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                حفظ التعديل
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">سجل تعديلات التقييم</h3>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {selectedEvaluation.editHistory?.map((edit, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-100 border-r-4 border-teal-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">{new Date(edit.editedAt).toLocaleDateString('ar-SA')}</span>
                    <span className="text-gray-500 text-xs">بواسطة: {edit.editedBy}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-gray-500">الدرجة السابقة:</span>
                      <span className="text-gray-700 mr-2">{getGradeLabel(edit.oldGrade)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">الدرجة الجديدة:</span>
                      <span className="text-teal-600 mr-2 font-bold">{getGradeLabel(edit.newGrade)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">النقاط السابقة:</span>
                      <span className="text-gray-700 mr-2">{edit.oldPoints}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">النقاط الجديدة:</span>
                      <span className="text-teal-600 mr-2 font-bold">{edit.newPoints}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-500 text-sm">السبب:</span>
                    <p className="text-gray-700 text-sm mt-1">{edit.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Edit Stat Modal - تعديل الإحصائية المعتمدة */}
      {showEditStatModal && selectedStat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">تعديل الإحصائية المعتمدة</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">المراقب</p>
                <p className="font-medium text-gray-900">{getObserverName(selectedStat.observerId)}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-900 mb-2 font-medium">الزيارات</label>
                  <input
                    type="number"
                    min="0"
                    value={statEditData.visitsCount}
                    onChange={(e) => setStatEditData({ ...statEditData, visitsCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-center"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 mb-2 font-medium">المخالفات</label>
                  <input
                    type="number"
                    min="0"
                    value={statEditData.violationsCount}
                    onChange={(e) => setStatEditData({ ...statEditData, violationsCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-center"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 mb-2 font-medium">الإنذارات</label>
                  <input
                    type="number"
                    min="0"
                    value={statEditData.warningsCount}
                    onChange={(e) => setStatEditData({ ...statEditData, warningsCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">ملاحظات</label>
                <textarea
                  value={statEditData.notes}
                  onChange={(e) => setStatEditData({ ...statEditData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-24"
                  placeholder="أدخل الملاحظات..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitStatEdit}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                حفظ التعديل
              </button>
              <button
                onClick={() => setShowEditStatModal(false)}
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
