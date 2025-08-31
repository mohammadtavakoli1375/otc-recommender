export interface PatientInfo {
  age: number;
  sex: 'M' | 'F';
  pregnantWeeks?: number;
  isBreastfeeding?: boolean;
  isElder: boolean;
  meds: string[];
}

export interface TriageInput {
  patient: PatientInfo;
  symptoms: string[];
  durationDays: number;
  redFlags: Record<string, boolean>;
}

export interface BlockedIngredient {
  ingredient: string;
  reason: string;
}

export interface Suggestion {
  ingredient: string;
  dose: string;
  maxDays: number;
  why: string;
  complementarySupplements?: {
    primary: string[];
    rationale: string;
    evidence: string;
  };
}

export interface TriageOutput {
  action: 'OK' | 'REFER_IMMEDIATE';
  blocks: BlockedIngredient[];
  avoid: BlockedIngredient[];
  suggestions: Suggestion[];
  education: string[];
  sources: string[];
}

// حذف شده - دیگر از Rule-based system استفاده نمی‌کنیم
// سیستم جدید مستقیماً از دیتاست OTC استفاده می‌کند