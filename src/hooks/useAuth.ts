// هوك المصادقة والصلاحيات - مع Supabase

import { useState, useCallback, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

// بيانات افتراضية في حال فشل الاتصال
const fallbackUsers: User[] = [
  { id: '1', name: 'موظف الجودة الأول', role: 'quality1', username: 'quality1' },
  { id: '2', name: 'موظف الجودة الثاني', role: 'quality2', username: 'quality2' },
  { id: '3', name: 'المشرف العام', role: 'supervisor', username: 'supervisor' },
];

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(fallbackUsers);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // تحميل المستخدمين من Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('id');
        
        if (error) {
          console.error('خطأ في تحميل المستخدمين:', error);
          setDataLoaded(true);
          setLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          const mappedUsers: User[] = data.map((u: any) => ({
            id: u.id.toString(),
            name: u.name,
            role: u.role as UserRole,
            username: u.username,
          }));
          setUsers(mappedUsers);
        }
        setDataLoaded(true);
      } catch (err) {
        console.error('خطأ في الاتصال:', err);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

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

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ name: user.name, role: user.role, username: user.username }])
        .select()
        .single();
      
      if (error) {
        console.error('خطأ في إضافة المستخدم:', error);
        const newUser: User = { ...user, id: Date.now().toString() };
        setUsers(prev => [...prev, newUser]);
        return newUser;
      }
      
      const newUser: User = { id: data.id.toString(), name: data.name, role: data.role as UserRole, username: data.username };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('خطأ:', err);
      const newUser: User = { ...user, id: Date.now().toString() };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.role) updateData.role = updates.role;
      if (updates.username) updateData.username = updates.username;
      const { error } = await supabase.from('users').update(updateData).eq('id', parseInt(id));
      if (error) console.error('خطأ في تحديث المستخدم:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', parseInt(id));
      if (error) console.error('خطأ في حذف المستخدم:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateUserPassword = useCallback(async (_id: string, _newPassword: string) => {
    // يمكن إضافة عمود password لاحقاً
  }, []);

  return {
    currentUser, users, login, logout, hasRole, canAccess,
    isAuthenticated: !!currentUser,
    addUser, updateUser, deleteUser, updateUserPassword,
    loading, dataLoaded,
  };
}
