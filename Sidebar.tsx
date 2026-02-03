import type { UserRole } from '@/types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  Award, 
  Users, 
  Settings,
  LogOut,
  BarChart3,
  UserCheck,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['quality1', 'quality2', 'supervisor'] },
  { id: 'data-entry', label: 'إدخال الإحصائيات', icon: ClipboardList, roles: ['quality1'] },
  { id: 'follow-up', label: 'المتابعة والتحليل', icon: TrendingUp, roles: ['quality2'] },
  { id: 'improvement', label: 'سلة التحسين', icon: BarChart3, roles: ['quality2'] },
  { id: 'supervisor', label: 'لوحة المشرف', icon: UserCheck, roles: ['supervisor'] },
  { id: 'observers', label: 'إدارة المراقبين', icon: Users, roles: ['supervisor'] },
  { id: 'statistics', label: 'الإحصائيات التنفيذية', icon: BarChart3, roles: ['supervisor', 'quality1', 'quality2'] },
  { id: 'honor-board', label: 'لوحة الشرف', icon: Award, roles: ['supervisor', 'quality2', 'quality1'] },
  { id: 'users', label: 'إدارة المستخدمين', icon: Shield, roles: ['supervisor'] },
  { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['supervisor'] },
];

export function Sidebar({ currentView, setView, userRole, onLogout }: SidebarProps) {
  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 min-h-screen flex flex-col" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">نظام الجودة</h2>
            <p className="text-gray-400 text-xs">متابعة المراقبين</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`sidebar-item w-full ${currentView === item.id ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={onLogout} className="sidebar-item w-full text-red-400 hover:text-red-300">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
