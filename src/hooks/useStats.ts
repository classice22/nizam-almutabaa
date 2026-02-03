// هوك إدارة الإحصائيات

import { useState, useCallback } from 'react';
import type { 
  WeeklyStats, 
  Evaluation, 
  ImprovementItem, 
  TimePeriod, 
  HonorBoardEntry, 
  EditHistory,
  Observer
} from '@/types';
import { 
  weeklyStats as initialStats, 
  evaluations as initialEvaluations, 
  improvementItems as initialImprovements,
  observers as initialObservers,
  getRegionName,
  pointsSystem 
} from '@/data/mockData';

export function useStats() {
  const [stats, setStats] = useState<WeeklyStats[]>(initialStats);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [improvements, setImprovements] = useState<ImprovementItem[]>(initialImprovements);
  const [observers, setObservers] = useState<Observer[]>(initialObservers);

  // إضافة إحصائية جديدة
  const addStat = useCallback((stat: Omit<WeeklyStats, 'id' | 'entryDate'>) => {
    // التحقق من عدم وجود إحصائية سابقة لنفس المراقب في نفس الأسبوع
    const existingStat = stats.find(s => 
      s.observerId === stat.observerId && 
      s.week === stat.week && 
      s.month === stat.month && 
      s.year === stat.year
    );
    
    if (existingStat) {
      throw new Error('تم تسجيل إحصائية لهذا المراقب في هذا الأسبوع مسبقاً');
    }

    // التحقق من صحة البيانات
    if (stat.visitsCount < 0 || stat.violationsCount < 0 || stat.warningsCount < 0) {
      throw new Error('لا يمكن إدخال قيم سالبة');
    }
    
    if (!stat.isOnLeave && stat.violationsCount > stat.visitsCount) {
      throw new Error('عدد المخالفات لا يمكن أن يتجاوز عدد الزيارات');
    }
    
    if (!stat.isOnLeave && stat.warningsCount > stat.visitsCount) {
      throw new Error('عدد الإنذارات لا يمكن أن يتجاوز عدد الزيارات');
    }

    const newStat: WeeklyStats = {
      ...stat,
      id: Date.now().toString(),
      entryDate: new Date().toISOString().split('T')[0],
    };
    setStats(prev => [...prev, newStat]);
    return newStat;
  }, [stats]);

  // تحديث إحصائية
  const updateStat = useCallback((id: string, updates: Partial<WeeklyStats>) => {
    setStats(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // إضافة تقييم
  const addEvaluation = useCallback((evaluation: Omit<Evaluation, 'id' | 'evaluationDate' | 'isEdited' | 'editHistory'>) => {
    const newEval: Evaluation = {
      ...evaluation,
      id: Date.now().toString(),
      evaluationDate: new Date().toISOString().split('T')[0],
      isEdited: false,
      editHistory: [],
    };
    setEvaluations(prev => [...prev, newEval]);
    return newEval;
  }, []);

  // تعديل تقييم مع حفظ السجل
  const editEvaluation = useCallback((id: string, updates: Partial<Evaluation>, editReason: string, editedBy: string) => {
    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        const editHistory: EditHistory = {
          editedAt: new Date().toISOString(),
          editedBy,
          oldGrade: e.grade,
          newGrade: updates.grade || e.grade,
          oldPoints: e.supervisorPoints,
          newPoints: updates.supervisorPoints || e.supervisorPoints,
          reason: editReason,
        };
        return { 
          ...e, 
          ...updates, 
          isEdited: true,
          editHistory: [...(e.editHistory || []), editHistory]
        };
      }
      return e;
    }));
  }, []);

  // حذف تقييم
  const deleteEvaluation = useCallback((id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  }, []);

  // حذف إحصائية
  const deleteStat = useCallback((id: string) => {
    setStats(prev => prev.filter(s => s.id !== id));
  }, []);

  // إضافة عنصر لسلة التحسين
  const addImprovement = useCallback((item: Omit<ImprovementItem, 'id'>) => {
    const newItem: ImprovementItem = {
      ...item,
      id: Date.now().toString(),
    };
    setImprovements(prev => [...prev, newItem]);
    return newItem;
  }, []);

  // تحديث خطة التحسين
  const updateImprovementPlan = useCallback((id: string, plan: string) => {
    setImprovements(prev => prev.map(item => 
      item.id === id ? { ...item, plan, planStatus: 'submitted', submissionDate: new Date().toISOString().split('T')[0] } : item
    ));
  }, []);

  // الحصول على الإحصائيات حسب الفترة
  const getStatsByPeriod = useCallback((period: TimePeriod) => {
    return stats.filter(s => 
      s.month === period.month && 
      s.year === period.year &&
      (period.week === undefined || s.week === period.week)
    );
  }, [stats]);

  // الحصول على التقييمات حسب الفترة
  const getEvaluationsByPeriod = useCallback((period: TimePeriod) => {
    return evaluations.filter(e => 
      e.month === period.month && 
      e.year === period.year &&
      (period.week === undefined || e.week === period.week)
    );
  }, [evaluations]);

  // الحصول على تقييم محدد
  const getEvaluation = useCallback((observerId: string, period: TimePeriod): Evaluation | undefined => {
    return evaluations.find(e => 
      e.observerId === observerId &&
      e.month === period.month && 
      e.year === period.year &&
      (period.week === undefined || e.week === period.week)
    );
  }, [evaluations]);

  // حساب النقاط الإيجابية
  const calculatePoints = useCallback((observerId: string, period: TimePeriod): number => {
    const observerStats = getStatsByPeriod(period).filter(s => 
      s.observerId === observerId && 
      s.status === 'approved' && 
      !s.isOnLeave
    );
    
    const observerEvals = getEvaluationsByPeriod(period).filter(e => e.observerId === observerId);
    
    // إذا كان في إجازة، لا نقاط
    const isOnLeave = observerStats.some(s => s.isOnLeave);
    if (isOnLeave) return 0;
    
    let points = 0;
    
    // نقاط الزيارات (كل زيارة = 1 نقطة)
    observerStats.forEach(stat => {
      points += stat.visitsCount * pointsSystem.visits.points;
    });
    
    // نقاط المخالفات (كل مخالفة = 4 نقاط إيجابية)
    observerStats.forEach(stat => {
      points += stat.violationsCount * pointsSystem.violations.points;
    });
    
    // نقاط الإنذارات (كل إنذار = 3 نقاط إيجابية)
    observerStats.forEach(stat => {
      points += stat.warningsCount * pointsSystem.warnings.points;
    });
    
    // نقاط التقييم
    observerEvals.forEach(eval_ => {
      points += pointsSystem.grades[eval_.grade].points;
      points += eval_.supervisorPoints;
    });
    
    return Math.max(0, points);
  }, [getStatsByPeriod, getEvaluationsByPeriod]);

  // لوحة الشرف - تعرض فقط المراقبين الذين لديهم إحصائيات معتمدة وتقييم
  const getHonorBoard = useCallback((period: TimePeriod): HonorBoardEntry[] => {
    const periodStats = getStatsByPeriod(period);
    const periodEvals = getEvaluationsByPeriod(period);
    
    // الحصول على معرفات المراقبين الذين لديهم إحصائيات معتمدة وغير في إجازة
    const approvedStats = periodStats.filter(s => s.status === 'approved' && !s.isOnLeave);
    const observersWithApprovedStats = new Set(approvedStats.map(s => s.observerId));
    
    // الحصول على المراقبين الذين لديهم تقييمات
    const observersWithEvaluations = new Set(periodEvals.map(e => e.observerId));
    
    // لوحة الشرف تتطلب إحصائية معتمدة + تقييم
    const eligibleObservers = observers.filter(o => 
      observersWithApprovedStats.has(o.id) && observersWithEvaluations.has(o.id)
    );
    
    const entries: HonorBoardEntry[] = eligibleObservers.map(observer => {
      const observerStats = approvedStats.filter(s => s.observerId === observer.id);
      const observerEvals = periodEvals.filter(e => e.observerId === observer.id);
      const evaluation = observerEvals[0];
      
      const visitsCount = observerStats.reduce((sum, s) => sum + s.visitsCount, 0);
      const violationsCount = observerStats.reduce((sum, s) => sum + s.violationsCount, 0);
      const warningsCount = observerStats.reduce((sum, s) => sum + s.warningsCount, 0);
      const supervisorPoints = observerEvals.reduce((sum, e) => sum + e.supervisorPoints, 0);
      
      const totalPoints = calculatePoints(observer.id, period);
      
      return {
        observerId: observer.id,
        observerName: observer.name,
        regionName: getRegionName(observer.regionId),
        totalPoints,
        visitsCount,
        violationsCount,
        warningsCount,
        supervisorPoints,
        rank: 0,
        evaluation,
      };
    });
    
    // ترتيب حسب النقاط تنازلياً
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // تحديث الترتيب
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries;
  }, [getStatsByPeriod, getEvaluationsByPeriod, calculatePoints]);

  // إضافة مراقب جديد
  const addObserver = useCallback((observer: Omit<Observer, 'id'>) => {
    const newObserver: Observer = {
      ...observer,
      id: Date.now().toString(),
    };
    setObservers(prev => [...prev, newObserver]);
    return newObserver;
  }, []);

  // تحديث مراقب
  const updateObserver = useCallback((id: string, updates: Partial<Observer>) => {
    setObservers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  // حذف مراقب
  const deleteObserver = useCallback((id: string) => {
    setObservers(prev => prev.filter(o => o.id !== id));
  }, []);

  // الإحصائيات العامة
  const getDashboardStats = useCallback(() => {
    const pendingCount = stats.filter(s => s.status === 'pending').length;
    const returnedCount = stats.filter(s => s.status === 'returned').length;
    const activeCount = observers.filter(o => o.status === 'active').length;
    const onLeaveCount = observers.filter(o => o.status === 'on_leave').length;
    
    const currentWeekStats = stats.filter(s => {
      const now = new Date();
      return s.week === getWeekNumber(now) && 
             s.month === now.getMonth() + 1 && 
             s.year === now.getFullYear() &&
             !s.isOnLeave &&
             s.status === 'approved';
    });
    
    return {
      totalObservers: observers.length,
      activeObservers: activeCount,
      onLeaveObservers: onLeaveCount,
      pendingApprovals: pendingCount,
      returnedForEdit: returnedCount,
      weeklyVisits: currentWeekStats.reduce((sum, s) => sum + s.visitsCount, 0),
      weeklyViolations: currentWeekStats.reduce((sum, s) => sum + s.violationsCount, 0),
    };
  }, [stats]);

  return {
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
    getStatsByPeriod,
    getEvaluationsByPeriod,
    getEvaluation,
    getHonorBoard,
    getDashboardStats,
    calculatePoints,
  };
}

// دالة مساعدة لحساب رقم الأسبوع
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
