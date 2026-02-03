import { useState } from 'react';
import type { WeeklyStats, ApprovalStatus } from '@/types';
import { observers, getObserverName, getRegionName, getStatusLabel } from '@/data/mockData';
import { Search, Eye, MessageSquare, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface FollowUpProps {
  stats: WeeklyStats[];
  updateStat: (id: string, updates: Partial<WeeklyStats>) => void;
}

export function FollowUp({ stats, updateStat }: FollowUpProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedStat, setSelectedStat] = useState<WeeklyStats | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const filteredStats = stats.filter(stat => {
    const observerName = getObserverName(stat.observerId);
    const matchesSearch = observerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || stat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReview = (stat: WeeklyStats) => {
    setSelectedStat(stat);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleApprove = () => {
    if (selectedStat) {
      updateStat(selectedStat.id, { status: 'approved' });
      setShowReviewModal(false);
      setSelectedStat(null);
    }
  };

  const handleReturn = () => {
    if (selectedStat) {
      updateStat(selectedStat.id, { status: 'returned', notes: reviewNotes });
      setShowReviewModal(false);
      setSelectedStat(null);
    }
  };

  const getStatusClass = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'returned': return 'status-returned';
      default: return '';
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">المتابعة والتحليل</h1>
        <p className="text-gray-400">مراجعة وتحليل إحصائيات المراقبين</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-custom w-full pr-10"
              placeholder="البحث باسم المراقب..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus | 'all')}
            className="input-custom"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="approved">معتمد</option>
            <option value="returned">معاد للتعديل</option>
          </select>
        </div>
      </div>

      {/* Stats Table */}
      <div className="card-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right p-4 text-gray-400 font-medium">المراقب</th>
                <th className="text-right p-4 text-gray-400 font-medium">المنطقة</th>
                <th className="text-center p-4 text-gray-400 font-medium">الفترة</th>
                <th className="text-center p-4 text-gray-400 font-medium">الزيارات</th>
                <th className="text-center p-4 text-gray-400 font-medium">المخالفات</th>
                <th className="text-center p-4 text-gray-400 font-medium">الإنذارات</th>
                <th className="text-center p-4 text-gray-400 font-medium">الحالة</th>
                <th className="text-center p-4 text-gray-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat) => {
                const observer = observers.find(o => o.id === stat.observerId);
                return (
                  <tr key={stat.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <p className="text-white font-medium">{getObserverName(stat.observerId)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-400">{getRegionName(observer?.regionId || '')}</p>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-white">{stat.year}/{stat.month}</p>
                      <p className="text-gray-400 text-sm">أسبوع {stat.week}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-teal-400 font-bold">{stat.visitsCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-orange-400 font-bold">{stat.violationsCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-red-400 font-bold">{stat.warningsCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(stat.status)}`}>
                        {getStatusLabel(stat.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleReview(stat)}
                        className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">لا توجد بيانات مطابقة للبحث</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedStat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-lg animate-fade-in">
            <h3 className="font-bold text-xl mb-6 text-gray-900">مراجعة الإحصائية</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <p className="text-gray-600 text-sm">المراقب</p>
                  <p className="font-medium text-gray-900">{getObserverName(selectedStat.observerId)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100">
                  <p className="text-gray-600 text-sm">الفترة</p>
                  <p className="font-medium text-gray-900">
                    {selectedStat.year}/{selectedStat.month} - أسبوع {selectedStat.week}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-teal-50 text-center">
                  <p className="text-teal-600 text-2xl font-bold">{selectedStat.visitsCount}</p>
                  <p className="text-gray-600 text-sm">زيارات</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 text-center">
                  <p className="text-orange-600 text-2xl font-bold">{selectedStat.violationsCount}</p>
                  <p className="text-gray-600 text-sm">مخالفات</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <p className="text-red-600 text-2xl font-bold">{selectedStat.warningsCount}</p>
                  <p className="text-gray-600 text-sm">إنذارات</p>
                </div>
              </div>

              {selectedStat.notes && (
                <div className="p-3 rounded-lg bg-gray-100">
                  <p className="text-gray-600 text-sm">ملاحظات</p>
                  <p className="text-gray-900">{selectedStat.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-gray-900 mb-2 font-medium">
                  <MessageSquare className="w-4 h-4 inline ml-2" />
                  ملاحظات المراجعة
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right resize-none h-24"
                  placeholder="أدخل ملاحظات المراجعة..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                اعتماد
              </button>
              <button
                onClick={handleReturn}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                إعادة للتعديل
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
