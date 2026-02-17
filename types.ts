
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum Goal {
  LOSE = 'LOSE',
  MAINTAIN = 'MAINTAIN',
  GAIN = 'GAIN'
}

export enum Pace {
  RELAXED = 'RELAXED',
  NORMAL = 'NORMAL',
  AGGRESSIVE = 'AGGRESSIVE'
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityMultiplier: number;
  baselineSteps: number;
  goal: Goal;
  pace: Pace;
  targetKcal: number;
  targetWaterMl: number;
  targetSteps: number;
  onboardingComplete: boolean;
  theme?: Theme;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  kcalPer100g: number;
  defaultGrams: number;
  householdMeasure: string;
}

export interface LoggedFood {
  id: string;
  foodId?: string;
  name: string;
  kcal: number;
  grams: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  timestamp: number;
}

export interface WaterEvent {
  amount: number;
  timestamp: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: LoggedFood[];
  water: WaterEvent[];
  steps: number;
  isLocked: boolean;
  weightAtTime?: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

export interface WorkoutPlan {
  [day: string]: ExerciseEntry[]; // "Monday", "Tuesday", etc.
}

export interface CheckIn {
  date: string;
  weight: number;
  adherence: number; // 1-10
  adjustment: number; // kcal adjustment recommendation
}

export interface AppState {
  profile: UserProfile | null;
  logs: Record<string, DailyLog>;
  workoutPlan: WorkoutPlan;
  checkIns: CheckIn[];
}
