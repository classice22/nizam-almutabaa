// أنواع البيانات الأساسية للنظام

export type UserRole = 'quality1' | 'quality2' | 'supervisor';

export type EvaluationGrade = 'excellent' | 'very_good' | 'acceptable' | 'needs_improvement' | 'neutral' | 'on_leave';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export type ObserverStatus = 'active' | 'on_leave';

export interface Region {
  id: string;
  name: string;
}

export interface Observer {
  id: string;
  name: string;
  regionId: string;
  status: ObserverStatus;
}

export interface WeeklyStats {
  id: string;
  observerId: string;
  week: number;
  month: number;
  year: number;
  visitsCount: number;
  violationsCount: number;
  warningsCount: number;
  notes: string;
  enteredBy: string;
  entryDate: string;
  status: ApprovalStatus;
  isOnLeave: boolean;
}

export interface Evaluation {
  id: string;
  observerId: string;
  week: number;
  month: number;
  year: number;
  grade: EvaluationGrade;
  supervisorPoints: number;
  notes: string;
  evaluatedBy: string;
  evaluationDate: string;
  isEdited: boolean;
  editHistory?: EditHistory[];
}

export interface EditHistory {
  editedAt: string;
  editedBy: string;
  oldGrade: EvaluationGrade;
  newGrade: EvaluationGrade;
  oldPoints: number;
  newPoints: number;
  reason: string;
}

export interface ImprovementItem {
  id: string;
  observerId: string;
  week: number;
  month: number;
  year: number;
  reason: string;
  plan: string;
  planStatus: 'draft' | 'submitted' | 'approved';
  submittedBy: string;
  submissionDate?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface DashboardStats {
  totalObservers: number;
  activeObservers: number;
  onLeaveObservers: number;
  pendingApprovals: number;
  weeklyVisits: number;
  weeklyViolations: number;
}

export interface HonorBoardEntry {
  observerId: string;
  observerName: string;
  regionName: string;
  totalPoints: number;
  visitsCount: number;
  violationsCount: number;
  warningsCount: number;
  supervisorPoints: number;
  rank: number;
  evaluation?: Evaluation;
}

export interface TimePeriod {
  week?: number;
  month: number;
  year: number;
}

// نظام النقاط المعدل
export interface PointsSystem {
  visits: { points: number; description: string };
  violations: { points: number; description: string };
  warnings: { points: number; description: string };
  grades: Record<EvaluationGrade, { points: number; description: string }>;
}
