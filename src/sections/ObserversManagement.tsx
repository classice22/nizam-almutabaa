import { useState } from 'react';
import type { Observer, ObserverStatus } from '@/types';
import { Users, UserCheck, UserX, Search, MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { regions } from '@/data/mockData';

interface ObserversManagementProps {
  observers: Observer[];
  addObserver: (observer: Omit<Observer, 'id'>) => void;
  updateObserver: (id: string, updates: Partial<Observer>) => void;
  deleteObserver: (id: string) => void;
}

export function ObserversManagement({ 
  observers, 
  addObserver, 
  updateObserver, 
  deleteObserver 
}: ObserversManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ObserverStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedObserver, setSelectedObserver] = useState<Observer | null>(null);
  const [observerData, setObserverData] = useState({
    name: '',
    regionId: '',
    status: 'active' as ObserverStatus,
  });

  const filteredObservers = observers.filter(observer => {
    const matchesSearch = observer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || observer.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || observer.regionId === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const activeCount = observers.filter(o => o.status === 'active').length;
  const onLeaveCount = observers.filter(o => o.status === 'on_leave').length;

  const handleAdd = () => {
    if (observerData.name.trim() && observerData.regionId) {
      addObserver({
        name: observerData.name.trim(),
        regionId: observerData.regionId,
        status: observerData.status,
      });
      setObserverData({ name: '', regionId: '', status: 'active' });
      setShowAddModal(false);
    }
  };

  const handleEdit = (observer: Observer) => {
    setSelectedObserver(observer);
    setObserverData({
      name: observer.name,
      regionId: observer.regionId,
      status: observer.status,
    });
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (selectedObserver && observerData.name.trim() && observerData.regionId) {
      updateObserver(selectedObserver.id, {
        name: observerData.name.trim(),
        regionId: observerData.regionId,
        status: observerData.status,
      });
      setShowEditModal(false);
      setSelectedObserver(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المراقب؟')) {
      deleteObserver(id);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">إدارة المراقبين</h1>
        <p className="text-gray-400">إضافة وتعديل وحذف المراقبين</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">إجمالي المراقبين</h3>
          <p className="text-3xl font-bold text-white">{observers.length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">المراقبين النشطين</h3>
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-500/20 flex items-center justify-center">
              <UserX className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">في إجازة</h3>
          <p className="text-3xl font-bold text-gray-400">{onLeaveCount}</p>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-custom w-full pr-10"
            placeholder="البحث باسم المراقب..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ObserverStatus | 'all')}
          className="input-custom"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="on_leave">في إجازة</option>
        </select>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="input-custom"
        >
          <option value="all">جميع المناطق</option>
          {regions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة مراقب
        </button>
      </div>

      {/* Observers by Region */}
      <div className="space-y-6">
        {regions.map(region => {
          const regionObservers = filteredObservers.filter(o => o.regionId === region.id);
          if (regionObservers.length === 0) return null;

          return (
            <div key={region.id} className="card-custom">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-white font-bold text-lg">{region.name}</h3>
                <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-sm">
                  {regionObservers.length} مراقب
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionObservers.map(observer => (
                  <div 
                    key={observer.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      observer.status === 'active' 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-gray-500/5 border-gray-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(observer)}
                          className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(observer.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-white font-medium text-sm mb-1">{observer.name}</p>
                    <p className="text-gray-400 text-xs">{region.name}</p>
                    <div className="mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        observer.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {observer.status === 'active' ? 'نشط' : 'في إجازة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredObservers.length === 0 && (
        <div className="text-center py-12 card-custom">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">لا توجد نتائج مطابقة للبحث</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">إضافة مراقب جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-900 mb-2 font-medium">اسم المراقب</label>
                <input
                  type="text"
                  value={observerData.name}
                  onChange={(e) => setObserverData({ ...observerData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل اسم المراقب..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">المنطقة</label>
                <select
                  value={observerData.regionId}
                  onChange={(e) => setObserverData({ ...observerData, regionId: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="">اختر المنطقة</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">الحالة</label>
                <select
                  value={observerData.status}
                  onChange={(e) => setObserverData({ ...observerData, status: e.target.value as ObserverStatus })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="active">نشط</option>
                  <option value="on_leave">في إجازة</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={!observerData.name.trim() || !observerData.regionId}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all disabled:opacity-50"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 rounded-lg font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedObserver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">تعديل المراقب</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-900 mb-2 font-medium">اسم المراقب</label>
                <input
                  type="text"
                  value={observerData.name}
                  onChange={(e) => setObserverData({ ...observerData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل اسم المراقب..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">المنطقة</label>
                <select
                  value={observerData.regionId}
                  onChange={(e) => setObserverData({ ...observerData, regionId: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="">اختر المنطقة</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">الحالة</label>
                <select
                  value={observerData.status}
                  onChange={(e) => setObserverData({ ...observerData, status: e.target.value as ObserverStatus })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="active">نشط</option>
                  <option value="on_leave">في إجازة</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitEdit}
                disabled={!observerData.name.trim() || !observerData.regionId}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all disabled:opacity-50"
              >
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
    </div>
  );
}
