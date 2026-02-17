
import { Gender, Pace, Goal, MacroTargets } from '../types';

/**
 * Mifflin-St Jeor Equation for BMR
 */
export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number => {
  if (gender === Gender.MALE) {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateTDEE = (bmr: number, multiplier: number): number => {
  return bmr * multiplier;
};

/**
 * Professional macro distribution based on goal and weight.
 * High protein (1.8-2.2g/kg) for weight loss to preserve muscle.
 */
export const calculateMacroTargets = (targetKcal: number, weightKg: number, goal: Goal): MacroTargets => {
  let proteinG: number;
  
  if (goal === Goal.LOSE) {
    proteinG = weightKg * 2.0; // Higher protein for muscle sparing
  } else if (goal === Goal.GAIN) {
    proteinG = weightKg * 1.8;
  } else {
    proteinG = weightKg * 1.6;
  }

  const fatKcal = targetKcal * 0.25; // 25% of energy from fat
  const fatG = fatKcal / 9;
  
  const remainingKcal = targetKcal - (proteinG * 4) - fatKcal;
  const carbsG = remainingKcal / 4;

  return {
    protein: Math.round(proteinG),
    carbs: Math.round(carbsG),
    fat: Math.round(fatG)
  };
};

export const calculateGoalKcal = (tdee: number, goal: Goal, pace: Pace): number => {
  let adjustment = 0;
  
  if (goal === Goal.LOSE) {
    switch (pace) {
      case Pace.RELAXED: adjustment = -300; break;
      case Pace.NORMAL: adjustment = -500; break;
      case Pace.AGGRESSIVE: adjustment = -800; break; // Aggressive but capped by safety check in UI
    }
  } else if (goal === Goal.GAIN) {
    switch (pace) {
      case Pace.RELAXED: adjustment = 200; break;
      case Pace.NORMAL: adjustment = 400; break;
      case Pace.AGGRESSIVE: adjustment = 600; break;
    }
  }
  
  return Math.round(tdee + adjustment);
};

export const calculateStepBurn = (steps: number, weightKg: number): number => {
  // Reliable estimate: 1 step = 0.04 - 0.06 kcal depending on weight
  // Using 0.0006 * weight as a multiplier
  return Math.round(steps * (weightKg * 0.00055));
};
