
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

export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}

export interface OnboardingAnswers {
  jobType: 'desk' | 'standing' | 'walking' | 'physical';
  commute: 'car' | 'public' | 'walk_bike';
  exerciseDays: number;
  workoutDuration: number;
  weekendActivity: 'low' | 'moderate' | 'high';
  manualSteps?: number;
}

export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmiCategory: string;
  activityMultiplier: number;
  baselineSteps: number;
  goal: Goal;
  pace: Pace;
  targetKcal: number;
  targetWaterMl: number;
  targetSteps: number;
  macroTargets: MacroTargets;
  onboardingComplete: boolean;
  onboardingAnswers?: OnboardingAnswers;
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
  refinement?: {
    fatType?: string;
    portionSize?: string;
    origin?: string;
  };
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
  [day: string]: ExerciseEntry[];
}

export interface CheckIn {
  date: string;
  weight: number;
  adherence: number; // 1-10
  stressLevel: number; // 1-5
  sleepQuality: number; // 1-5
  adjustment: number; // kcal adjustment recommendation
}

export interface AIScanResult {
  dishName: string;
  estimatedGrams: number;
  estimatedKcal: number;
  confidence: number;
  ingredients: string[];
}

export interface AppState {
  profile: UserProfile | null;
  logs: Record<string, DailyLog>;
  workoutPlan: WorkoutPlan;
  checkIns: CheckIn[];
}
