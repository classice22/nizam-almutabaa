import { useState } from 'react';
import type { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';
import { LoginForm } from '@/sections/LoginForm';
import { Sidebar } from '@/sections/Sidebar';
import { Dashboard } from '@/sections/Dashboard';
import { DataEntry } from '@/sections/DataEntry';
import { FollowUp } from '@/sections/FollowUp';
import { ImprovementBasket } from '@/sections/ImprovementBasket';
import { SupervisorPanel } from '@/sections/SupervisorPanel';
import { ObserversManagement } from '@/sections/ObserversManagement';
import { ExecutiveStatistics } from '@/sections/ExecutiveStatistics';
import { HonorBoard } from '@/sections/HonorBoard';
import { UsersManagement } from '@/sections/UsersManagement';
import './App.css';

function App() {
  const { 
    currentUser, 
    users,
    login, 
    logout, 
    isAuthenticated, 
    hasRole,
    addUser,
    updateUser,
    deleteUser,
    updateUserPassword,
    loading: authLoading,
  } = useAuth();
  const { 
    stats, 
    evaluations,
    improvements,
    observers,
    addStat, 
    updateStat, 
    deleteStat,
    addEvaluation, 
    editEvaluation,
    deleteEvaluation,
    addImprovement, 
    updateImprovementPlan,
    addObserver,
    updateObserver,
    deleteObserver,
    getDashboardStats,
    getEvaluation
  } = useStats();
  
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = (username: string, password: string): boolean => {
    return login(username, password);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
  };

  // تحديد العرض بناءً على نوع المستخدم
  const getDefaultView = (role: UserRole): string => {
    switch (role) {
      case 'quality1':
        return 'data-entry';
      case 'quality2':
        return 'follow-up';
      case 'supervisor':
        return 'supervisor';
      default:
        return 'dashboard';
    }
  };

  // عند تسجيل الدخول، تعيين العرض المناسب
  if (isAuthenticated && currentView === 'dashboard' && currentUser) {
    const defaultView = getDefaultView(currentUser.role);
    if (defaultView !== 'dashboard') {
      setCurrentView(defaultView);
    }
  }

  // عرض شاشة التحميل
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e3144' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // عرض تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ background: '#0e3144' }}>
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  // عرض المحتوى الرئيسي
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard getDashboardStats={getDashboardStats} />;
      case 'data-entry':
        return hasRole('quality1') ? (
          <DataEntry 
            stats={stats}
            addStat={addStat}
            updateStat={updateStat}
            currentUserId={currentUser?.id || ''} 
          />
        ) : null;
      case 'follow-up':
        return hasRole('quality2') ? (
          <FollowUp 
            stats={stats} 
            updateStat={updateStat} 
          />
        ) : null;
      case 'improvement':
        return hasRole('quality2') ? (
          <ImprovementBasket 
            improvements={improvements}
            updateImprovementPlan={updateImprovementPlan}
            stats={stats}
          />
        ) : null;
      case 'supervisor':
        return hasRole('supervisor') ? (
          <SupervisorPanel 
            stats={stats}
            evaluations={evaluations}
            updateStat={updateStat}
            deleteStat={deleteStat}
            addEvaluation={addEvaluation}
            addImprovement={addImprovement}
            editEvaluation={editEvaluation}
            deleteEvaluation={deleteEvaluation}
            getEvaluation={getEvaluation}
          />
        ) : null;
      case 'observers':
        return hasRole('supervisor') ? (
          <ObserversManagement 
            observers={observers}
            addObserver={addObserver}
            updateObserver={updateObserver}
            deleteObserver={deleteObserver}
          />
        ) : null;
      case 'statistics':
        return hasRole('supervisor') || hasRole('quality1') || hasRole('quality2') ? (
          <ExecutiveStatistics stats={stats} evaluations={evaluations} />
        ) : null;
      case 'honor-board':
        return <HonorBoard stats={stats} evaluations={evaluations} />;
      case 'users':
        return hasRole('supervisor') ? (
          <UsersManagement 
            users={users}
            addUser={addUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
            updateUserPassword={updateUserPassword}
          />
        ) : null;
      default:
        return <Dashboard getDashboardStats={getDashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0e3144' }}>
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        userRole={currentUser?.role || 'quality1'}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">
              نظام متابعة أداء المراقبين
            </h2>
            <p className="text-gray-400 text-sm">
              {currentUser?.role === 'quality1' ? 'موظف جودة أول' :
               currentUser?.role === 'quality2' ? 'موظف جودة ثانٍ' :
               currentUser?.role === 'supervisor' ? 'المشرف العام' : ''} - {currentUser?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-gray-400 text-sm">التاريخ</p>
              <p className="text-white font-medium">
                {new Date().toLocaleDateString('ar-SA', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
