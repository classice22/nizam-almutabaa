import { useState } from 'react';
import { User, Lock, TrendingUp } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    
    const success = onLogin(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">نظام متابعة أداء المراقبين</h1>
          <p className="text-gray-400">منصة متكاملة لتقييم وتحسين أداء فرق المراقبة الميدانية</p>
        </div>

        {/* Login Card */}
        <div className="card-custom">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-white mb-2 font-medium">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-custom w-full pr-10"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white mb-2 font-medium">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-custom w-full pr-10"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full">
              تسجيل الدخول
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            نظام متابعة أداء المراقبين © 2026
          </p>
          <p className="text-gray-600 text-xs mt-1">
            تطوير وتشغيل: إدارة الجودة
          </p>
        </div>
      </div>
    </div>
  );
}
