// قائمة الموظفين المشتركة لجميع الأنظمة الجديدة
// تُستخدم في: معادلة الأداء، الإجازات، المهام، الإجراءات الإدارية

export interface Employee {
  id: string;
  name: string;
  isActive: boolean;
}

export const employees: Employee[] = [
  { id: 'emp-1', name: 'فضه فارس صالح الجريد', isActive: true },
  { id: 'emp-2', name: 'وفاء اسماعيل حامد العيسى', isActive: true },
  { id: 'emp-3', name: 'فهده عايد كردي العنزي', isActive: true },
  { id: 'emp-4', name: 'خالد كريم نزال البيالي', isActive: true },
  { id: 'emp-5', name: 'سويلم مشارع معتق الشراري', isActive: true },
  { id: 'emp-6', name: 'لطيفه عديد عويد الرويلي', isActive: true },
  { id: 'emp-7', name: 'عبدالعزيز نمر فريح الرويلي', isActive: true },
  { id: 'emp-8', name: 'عبدالله حجاج لبيدان الشمري', isActive: true },
  { id: 'emp-9', name: 'عنود مخيليل رويشد العنزي', isActive: true },
  { id: 'emp-10', name: 'سليمان محمد عبدالله الحميدان', isActive: true },
  { id: 'emp-11', name: 'سعد مدالله ناوي الشراري', isActive: true },
  { id: 'emp-12', name: 'منصور سلامه سليمان الشراري', isActive: true },
  { id: 'emp-13', name: 'خلود شعيب الرويلي', isActive: true },
  { id: 'emp-14', name: 'فهد مخلد عايد الخميس', isActive: true },
  { id: 'emp-15', name: 'صالح فلاح صبيح الشراري', isActive: true },
  { id: 'emp-16', name: 'محمد شباط جعران الرويلي', isActive: true },
  { id: 'emp-17', name: 'زايد مبروك زايد اللاحم', isActive: true },
  { id: 'emp-18', name: 'عبدالرحمن دحيلان كاسب الشراري', isActive: true },
  { id: 'emp-19', name: 'عبدالعزيز عواد العنزي', isActive: true },
  { id: 'emp-20', name: 'معتز نايف الخالدي', isActive: true },
  { id: 'emp-21', name: 'أحمد عليان العنيزان', isActive: true },
  { id: 'emp-22', name: 'سعيد بصيلان الشراري', isActive: true },
  { id: 'emp-23', name: 'ماجد عواد سليمان السرحاني', isActive: true },
  { id: 'emp-24', name: 'عادل نشمي العنزي', isActive: true },
  { id: 'emp-25', name: 'مساعد أحمد الدرعان', isActive: true },
  { id: 'emp-26', name: 'مسفر علي آل جريب', isActive: true },
];

// دالة للحصول على اسم الموظف
export const getEmployeeName = (employeeId: string): string => {
  const employee = employees.find(e => e.id === employeeId);
  return employee?.name || 'غير معروف';
};

// دالة للحصول على الموظفين النشطين فقط
export const getActiveEmployees = (): Employee[] => {
  return employees.filter(e => e.isActive);
};
