-- ===================================================
-- إعداد جداول Supabase لنظام متابعة أداء المراقبين
-- نفّذ هذا الكود في Supabase SQL Editor
-- ===================================================

-- 1. حذف الجداول القديمة إذا كانت موجودة (احتياطي)
DROP TABLE IF EXISTS improvements CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS weekly_stats CASCADE;
DROP TABLE IF EXISTS observers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. جدول المستخدمين
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('quality1', 'quality2', 'supervisor')),
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول المراقبين
CREATE TABLE observers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الإحصائيات الأسبوعية
CREATE TABLE weekly_stats (
  id SERIAL PRIMARY KEY,
  observer_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  visits_count INTEGER DEFAULT 0,
  violations_count INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  entered_by TEXT DEFAULT '',
  entry_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  is_on_leave BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول التقييمات
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  observer_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  grade TEXT DEFAULT 'neutral',
  supervisor_points INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  evaluated_by TEXT DEFAULT '',
  evaluation_date DATE DEFAULT CURRENT_DATE,
  is_edited BOOLEAN DEFAULT FALSE,
  edit_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول سلة التحسين
CREATE TABLE improvements (
  id SERIAL PRIMARY KEY,
  observer_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  plan TEXT DEFAULT '',
  plan_status TEXT DEFAULT 'draft' CHECK (plan_status IN ('draft', 'submitted', 'approved')),
  submitted_by TEXT DEFAULT '',
  submission_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. إدخال البيانات الأولية - المستخدمين
INSERT INTO users (name, role, username) VALUES
  ('موظف الجودة الأول', 'quality1', 'quality1'),
  ('موظف الجودة الثاني', 'quality2', 'quality2'),
  ('المشرف العام', 'supervisor', 'supervisor');

-- 8. إدخال البيانات الأولية - المراقبين
INSERT INTO observers (name, region_id, status) VALUES
  ('لطيفه عديد عويد الرويلي', 1, 'active'),
  ('عادل نشمي العنزي', 1, 'active'),
  ('عبدالعزيز نمر فريح الرويلي', 1, 'active'),
  ('سليمان محمد عبدالله الحميدان', 2, 'active'),
  ('مسفر علي آل جريب', 2, 'active'),
  ('سويلم مشارع معتق الشراري', 2, 'active'),
  ('وفاء اسماعيل حامد العيسى', 2, 'active'),
  ('فضه فارس صالح الجريد', 2, 'active'),
  ('صالح فلاح صبيح الشراري', 3, 'active'),
  ('سعيد بصيلان الشراري', 3, 'active'),
  ('سعد مدالله ناوي الشراري', 4, 'active');

-- 9. تفعيل Realtime للجداول (مهم جداً للتحديث الفوري)
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;
ALTER PUBLICATION supabase_realtime ADD TABLE improvements;
ALTER PUBLICATION supabase_realtime ADD TABLE observers;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- 10. إعطاء صلاحيات القراءة والكتابة (RLS مُعطّل للتبسيط)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- سياسة السماح للجميع (للتبسيط - يمكن تعديلها لاحقاً)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for observers" ON observers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for weekly_stats" ON weekly_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for evaluations" ON evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for improvements" ON improvements FOR ALL USING (true) WITH CHECK (true);
