import { useState } from 'react';
import type { User, UserRole } from '@/types';
import { Users, UserPlus, Edit2, Trash2, X, Lock, Shield, UserCheck } from 'lucide-react';

interface UsersManagementProps {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateUserPassword: (id: string, newPassword: string) => void;
}

const roleLabels: Record<UserRole, string> = {
  supervisor: 'المشرف العام',
  quality1: 'موظف جودة أول',
  quality2: 'موظف جودة ثانٍ',
};

const roleColors: Record<UserRole, string> = {
  supervisor: 'bg-purple-500/20 text-purple-400',
  quality1: 'bg-teal-500/20 text-teal-400',
  quality2: 'bg-blue-500/20 text-blue-400',
};

export function UsersManagement({ 
  users, 
  addUser, 
  updateUser, 
  deleteUser,
  updateUserPassword 
}: UsersManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    role: 'quality1' as UserRole,
  });
  const [newPassword, setNewPassword] = useState('');

  const handleAdd = () => {
    if (userData.name.trim() && userData.username.trim()) {
      addUser({
        name: userData.name.trim(),
        username: userData.username.trim(),
        role: userData.role,
      });
      setUserData({ name: '', username: '', role: 'quality1' });
      setShowAddModal(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setUserData({
      name: user.name,
      username: user.username,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const submitEdit = () => {
    if (selectedUser && userData.name.trim() && userData.username.trim()) {
      updateUser(selectedUser.id, {
        name: userData.name.trim(),
        username: userData.username.trim(),
        role: userData.role,
      });
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const submitPasswordChange = () => {
    if (selectedUser && newPassword.trim()) {
      updateUserPassword(selectedUser.id, newPassword.trim());
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('تم تغيير كلمة المرور بنجاح');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      deleteUser(id);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h1>
        <p className="text-gray-400">إضافة وتعديل وحذف حسابات المستخدمين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">المشرفون</h3>
          <p className="text-3xl font-bold text-purple-400">
            {users.filter(u => u.role === 'supervisor').length}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">موظفو الجودة 1</h3>
          <p className="text-3xl font-bold text-teal-400">
            {users.filter(u => u.role === 'quality1').length}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">موظفو الجودة 2</h3>
          <p className="text-3xl font-bold text-blue-400">
            {users.filter(u => u.role === 'quality2').length}
          </p>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* Users List */}
      <div className="card-custom">
        <h3 className="text-white font-bold text-lg mb-4">قائمة المستخدمين</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleColors[user.role]}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChangePassword(user)}
                    className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    title="تغيير كلمة المرور"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 rounded-lg bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">إضافة مستخدم جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-900 mb-2 font-medium">الاسم الكامل</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل الاسم الكامل..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">اسم المستخدم</label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل اسم المستخدم..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">الدور</label>
                <select
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="supervisor">المشرف العام</option>
                  <option value="quality1">موظف جودة أول</option>
                  <option value="quality2">موظف جودة ثانٍ</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-yellow-700 text-sm">
                  <Lock className="w-4 h-4 inline ml-2" />
                  كلمة المرور الافتراضية: 123456
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={!userData.name.trim() || !userData.username.trim()}
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
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">تعديل المستخدم</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-900 mb-2 font-medium">الاسم الكامل</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل الاسم الكامل..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">اسم المستخدم</label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل اسم المستخدم..."
                />
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">الدور</label>
                <select
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                >
                  <option value="supervisor">المشرف العام</option>
                  <option value="quality1">موظف جودة أول</option>
                  <option value="quality2">موظف جودة ثانٍ</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitEdit}
                disabled={!userData.name.trim() || !userData.username.trim()}
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

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="modal-content w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">تغيير كلمة المرور</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-gray-600 text-sm">المستخدم</p>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
              </div>

              <div>
                <label className="block text-gray-900 mb-2 font-medium">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-right"
                  placeholder="أدخل كلمة المرور الجديدة..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitPasswordChange}
                disabled={!newPassword.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all disabled:opacity-50"
              >
                تغيير كلمة المرور
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
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
