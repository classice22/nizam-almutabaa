// هوك المصادقة والصلاحيات

import { useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { users as initialUsers } from '@/data/mockData';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const login = useCallback((username: string, password: string): boolean => {
    const user = users.find(u => u.username === username);
    if (user && password === '123456') {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const hasRole = useCallback((role: UserRole): boolean => {
    return currentUser?.role === role;
  }, [currentUser]);

  const canAccess = useCallback((roles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  }, [currentUser]);

  // إدارة المستخدمين - للمشرف فقط
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateUserPassword = useCallback((id: string, _newPassword: string) => {
    // في النظام الحقيقي، سيتم تحديث كلمة المرور في قاعدة البيانات
    // هنا نحن فقط نحدث المستخدم
    setUsers(prev => prev.map(u => u.id === id ? { ...u } : u));
  }, []);

  return {
    currentUser,
    users,
    login,
    logout,
    hasRole,
    canAccess,
    isAuthenticated: !!currentUser,
    addUser,
    updateUser,
    deleteUser,
    updateUserPassword,
  };
}
