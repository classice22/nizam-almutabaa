// هوك إدارة الإحصائيات - مع Supabase

import { useState, useCallback, useEffect } from 'react';
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
  getRegionName,
  pointsSystem 
} from '@/data/mockData';
import { supabase } from '@/lib/supabase';

export function useStats() {
  const [stats, setStats] = useState<WeeklyStats[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);
  const [observers, setObservers] = useState<Observer[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== تحميل البيانات من Supabase =====
  
  const loadObservers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('observers')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('خطأ في تحميل المراقبين:', error);
        return;
      }
      
      if (data) {
        const mapped: Observer[] = data.map(o => ({
          id: o.id.toString(),
          name: o.name,
          regionId: o.region_id.toString(),
          status: o.status || 'active',
        }));
        setObservers(mapped);
      }
    } catch (err) {
      console.error('خطأ:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        return;
      }
      
      if (data) {
        const mapped: WeeklyStats[] = data.map(s => ({
          id: s.id.toString(),
          observerId: s.observer_id.toString(),
          week: s.week,
          month: s.month,
          year: s.year,
          visitsCount: s.visits_count || 0,
          violationsCount: s.violations_count || 0,
          warningsCount: s.warnings_count || 0,
          notes: s.notes || '',
          enteredBy: s.entered_by || '',
          entryDate: s.entry_date || new Date().toISOString().split('T')[0],
          status: s.status || 'pending',
          isOnLeave: s.is_on_leave || false,
        }));
        setStats(mapped);
      }
    } catch (err) {
      console.error('خطأ:', err);
    }
  }, []);

  const loadEvaluations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('خطأ في تحميل التقييمات:', error);
        return;
      }
      
      if (data) {
        const mapped: Evaluation[] = data.map(e => ({
          id: e.id.toString(),
          observerId: e.observer_id.toString(),
          week: e.week,
          month: e.month,
          year: e.year,
          grade: e.grade || 'neutral',
          supervisorPoints: e.supervisor_points || 0,
          notes: e.notes || '',
          evaluatedBy: e.evaluated_by || '',
          evaluationDate: e.evaluation_date || new Date().toISOString().split('T')[0],
          isEdited: e.is_edited || false,
          editHistory: e.edit_history || [],
        }));
        setEvaluations(mapped);
      }
    } catch (err) {
      console.error('خطأ:', err);
    }
  }, []);

  const loadImprovements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('improvements')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('خطأ في تحميل سلة التحسين:', error);
        return;
      }
      
      if (data) {
        const mapped: ImprovementItem[] = data.map(i => ({
          id: i.id.toString(),
          observerId: i.observer_id.toString(),
          week: i.week,
          month: i.month,
          year: i.year,
          reason: i.reason || '',
          plan: i.plan || '',
          planStatus: i.plan_status || 'draft',
          submittedBy: i.submitted_by || '',
          submissionDate: i.submission_date,
        }));
        setImprovements(mapped);
      }
    } catch (err) {
      console.error('خطأ:', err);
    }
  }, []);

  // تحميل جميع البيانات عند بدء التطبيق
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadObservers(),
        loadStats(),
        loadEvaluations(),
        loadImprovements(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [loadObservers, loadStats, loadEvaluations, loadImprovements]);

  // ===== الاشتراك في التحديثات الفورية (Realtime) =====
  
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_stats' }, () => {
        loadStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations' }, () => {
        loadEvaluations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'improvements' }, () => {
        loadImprovements();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'observers' }, () => {
        loadObservers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStats, loadEvaluations, loadImprovements, loadObservers]);

  // ===== العمليات على الإحصائيات =====

  const addStat = useCallback(async (stat: Omit<WeeklyStats, 'id' | 'entryDate'>) => {
    // التحقق من عدم وجود إحصائية سابقة
    const existingStat = stats.find(s => 
      s.observerId === stat.observerId && 
      s.week === stat.week && 
      s.month === stat.month && 
      s.year === stat.year
    );
    
    if (existingStat) {
      throw new Error('تم تسجيل إحصائية لهذا المراقب في هذا الأسبوع مسبقاً');
    }

    if (stat.visitsCount < 0 || stat.violationsCount < 0 || stat.warningsCount < 0) {
      throw new Error('لا يمكن إدخال قيم سالبة');
    }
    
    if (!stat.isOnLeave && stat.violationsCount > stat.visitsCount) {
      throw new Error('عدد المخالفات لا يمكن أن يتجاوز عدد الزيارات');
    }
    
    if (!stat.isOnLeave && stat.warningsCount > stat.visitsCount) {
      throw new Error('عدد الإنذارات لا يمكن أن يتجاوز عدد الزيارات');
    }

    const entryDate = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('weekly_stats')
        .insert([{
          observer_id: parseInt(stat.observerId),
          week: stat.week,
          month: stat.month,
          year: stat.year,
          visits_count: stat.visitsCount,
          violations_count: stat.violationsCount,
          warnings_count: stat.warningsCount,
          notes: stat.notes,
          entered_by: stat.enteredBy,
          entry_date: entryDate,
          status: stat.status || 'pending',
          is_on_leave: stat.isOnLeave,
        }])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة الإحصائية:', error);
        // fallback محلي
        const newStat: WeeklyStats = {
          ...stat,
          id: Date.now().toString(),
          entryDate,
        };
        setStats(prev => [...prev, newStat]);
        return newStat;
      }

      const newStat: WeeklyStats = {
        ...stat,
        id: data.id.toString(),
        entryDate,
      };
      setStats(prev => [...prev, newStat]);
      return newStat;
    } catch (err) {
      console.error('خطأ:', err);
      const newStat: WeeklyStats = {
        ...stat,
        id: Date.now().toString(),
        entryDate,
      };
      setStats(prev => [...prev, newStat]);
      return newStat;
    }
  }, [stats]);

  const updateStat = useCallback(async (id: string, updates: Partial<WeeklyStats>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.visitsCount !== undefined) updateData.visits_count = updates.visitsCount;
      if (updates.violationsCount !== undefined) updateData.violations_count = updates.violationsCount;
      if (updates.warningsCount !== undefined) updateData.warnings_count = updates.warningsCount;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.isOnLeave !== undefined) updateData.is_on_leave = updates.isOnLeave;

      const { error } = await supabase
        .from('weekly_stats')
        .update(updateData)
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في تحديث الإحصائية:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setStats(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStat = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_stats')
        .delete()
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في حذف الإحصائية:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setStats(prev => prev.filter(s => s.id !== id));
  }, []);

  // ===== العمليات على التقييمات =====

  const addEvaluation = useCallback(async (evaluation: Omit<Evaluation, 'id' | 'evaluationDate' | 'isEdited' | 'editHistory'>) => {
    const evaluationDate = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert([{
          observer_id: parseInt(evaluation.observerId),
          week: evaluation.week,
          month: evaluation.month,
          year: evaluation.year,
          grade: evaluation.grade,
          supervisor_points: evaluation.supervisorPoints,
          notes: evaluation.notes,
          evaluated_by: evaluation.evaluatedBy,
          evaluation_date: evaluationDate,
          is_edited: false,
          edit_history: [],
        }])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة التقييم:', error);
        const newEval: Evaluation = {
          ...evaluation,
          id: Date.now().toString(),
          evaluationDate,
          isEdited: false,
          editHistory: [],
        };
        setEvaluations(prev => [...prev, newEval]);
        return newEval;
      }

      const newEval: Evaluation = {
        ...evaluation,
        id: data.id.toString(),
        evaluationDate,
        isEdited: false,
        editHistory: [],
      };
      setEvaluations(prev => [...prev, newEval]);
      return newEval;
    } catch (err) {
      console.error('خطأ:', err);
      const newEval: Evaluation = {
        ...evaluation,
        id: Date.now().toString(),
        evaluationDate,
        isEdited: false,
        editHistory: [],
      };
      setEvaluations(prev => [...prev, newEval]);
      return newEval;
    }
  }, []);

  const editEvaluation = useCallback(async (id: string, updates: Partial<Evaluation>, editReason: string, editedBy: string) => {
    const currentEval = evaluations.find(e => e.id === id);
    if (!currentEval) return;

    const editHistory: EditHistory = {
      editedAt: new Date().toISOString(),
      editedBy,
      oldGrade: currentEval.grade,
      newGrade: updates.grade || currentEval.grade,
      oldPoints: currentEval.supervisorPoints,
      newPoints: updates.supervisorPoints || currentEval.supervisorPoints,
      reason: editReason,
    };

    const newEditHistory = [...(currentEval.editHistory || []), editHistory];

    try {
      const updateData: Record<string, unknown> = {
        is_edited: true,
        edit_history: newEditHistory,
      };
      if (updates.grade) updateData.grade = updates.grade;
      if (updates.supervisorPoints !== undefined) updateData.supervisor_points = updates.supervisorPoints;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('evaluations')
        .update(updateData)
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في تعديل التقييم:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }

    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        return { 
          ...e, 
          ...updates, 
          isEdited: true,
          editHistory: newEditHistory,
        };
      }
      return e;
    }));
  }, [evaluations]);

  const deleteEvaluation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في حذف التقييم:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setEvaluations(prev => prev.filter(e => e.id !== id));
  }, []);

  // ===== سلة التحسين =====

  const addImprovement = useCallback(async (item: Omit<ImprovementItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('improvements')
        .insert([{
          observer_id: parseInt(item.observerId),
          week: item.week,
          month: item.month,
          year: item.year,
          reason: item.reason,
          plan: item.plan,
          plan_status: item.planStatus || 'draft',
          submitted_by: item.submittedBy,
          submission_date: item.submissionDate,
        }])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة عنصر التحسين:', error);
        const newItem: ImprovementItem = { ...item, id: Date.now().toString() };
        setImprovements(prev => [...prev, newItem]);
        return newItem;
      }

      const newItem: ImprovementItem = {
        ...item,
        id: data.id.toString(),
      };
      setImprovements(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('خطأ:', err);
      const newItem: ImprovementItem = { ...item, id: Date.now().toString() };
      setImprovements(prev => [...prev, newItem]);
      return newItem;
    }
  }, []);

  const updateImprovementPlan = useCallback(async (id: string, plan: string) => {
    const submissionDate = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('improvements')
        .update({
          plan,
          plan_status: 'submitted',
          submission_date: submissionDate,
        })
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في تحديث خطة التحسين:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    
    setImprovements(prev => prev.map(item => 
      item.id === id ? { ...item, plan, planStatus: 'submitted', submissionDate } : item
    ));
  }, []);

  // ===== المراقبين =====

  const addObserver = useCallback(async (observer: Omit<Observer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('observers')
        .insert([{
          name: observer.name,
          region_id: parseInt(observer.regionId),
          status: observer.status || 'active',
        }])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إضافة المراقب:', error);
        const newObserver: Observer = { ...observer, id: Date.now().toString() };
        setObservers(prev => [...prev, newObserver]);
        return newObserver;
      }

      const newObserver: Observer = {
        ...observer,
        id: data.id.toString(),
      };
      setObservers(prev => [...prev, newObserver]);
      return newObserver;
    } catch (err) {
      console.error('خطأ:', err);
      const newObserver: Observer = { ...observer, id: Date.now().toString() };
      setObservers(prev => [...prev, newObserver]);
      return newObserver;
    }
  }, []);

  const updateObserver = useCallback(async (id: string, updates: Partial<Observer>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.regionId) updateData.region_id = parseInt(updates.regionId);
      if (updates.status) updateData.status = updates.status;

      const { error } = await supabase
        .from('observers')
        .update(updateData)
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في تحديث المراقب:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setObservers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteObserver = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('observers')
        .delete()
        .eq('id', parseInt(id));

      if (error) console.error('خطأ في حذف المراقب:', error);
    } catch (err) {
      console.error('خطأ:', err);
    }
    setObservers(prev => prev.filter(o => o.id !== id));
  }, []);

  // ===== دوال الاستعلام (نفس المنطق السابق) =====

  const getStatsByPeriod = useCallback((period: TimePeriod) => {
    return stats.filter(s => 
      s.month === period.month && 
      s.year === period.year &&
      (period.week === undefined || s.week === period.week)
    );
  }, [stats]);

  const getEvaluationsByPeriod = useCallback((period: TimePeriod) => {
    return evaluations.filter(e => 
      e.month === period.month && 
      e.year === period.year &&
      (period.week === undefined || e.week === period.week)
    );
  }, [evaluations]);

  const getEvaluation = useCallback((observerId: string, period: TimePeriod): Evaluation | undefined => {
    return evaluations.find(e => 
      e.observerId === observerId &&
      e.month === period.month && 
      e.year === period.year &&
      (period.week === undefined || e.week === period.week)
    );
  }, [evaluations]);

  const calculatePoints = useCallback((observerId: string, period: TimePeriod): number => {
    const observerStats = getStatsByPeriod(period).filter(s => 
      s.observerId === observerId && 
      s.status === 'approved' && 
      !s.isOnLeave
    );
    
    const observerEvals = getEvaluationsByPeriod(period).filter(e => e.observerId === observerId);
    
    const isOnLeave = observerStats.some(s => s.isOnLeave);
    if (isOnLeave) return 0;
    
    let points = 0;
    
    observerStats.forEach(stat => {
      points += stat.visitsCount * pointsSystem.visits.points;
    });
    
    observerStats.forEach(stat => {
      points += stat.violationsCount * pointsSystem.violations.points;
    });
    
    observerStats.forEach(stat => {
      points += stat.warningsCount * pointsSystem.warnings.points;
    });
    
    observerEvals.forEach(eval_ => {
      points += pointsSystem.grades[eval_.grade].points;
      points += eval_.supervisorPoints;
    });
    
    return Math.max(0, points);
  }, [getStatsByPeriod, getEvaluationsByPeriod]);

  const getHonorBoard = useCallback((period: TimePeriod): HonorBoardEntry[] => {
    const periodStats = getStatsByPeriod(period);
    const periodEvals = getEvaluationsByPeriod(period);
    
    const approvedStats = periodStats.filter(s => s.status === 'approved' && !s.isOnLeave);
    const observersWithApprovedStats = new Set(approvedStats.map(s => s.observerId));
    const observersWithEvaluations = new Set(periodEvals.map(e => e.observerId));
    
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
    
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries;
  }, [getStatsByPeriod, getEvaluationsByPeriod, calculatePoints, observers]);

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
  }, [stats, observers]);

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
    loading,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
