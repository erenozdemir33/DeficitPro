
import { Gender, Pace, Goal } from '../types';

/**
 * Mifflin-St Jeor Equation
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

export const calculateTDEE = (bmr: number, multiplier: number): number => {
  return bmr * multiplier;
};

export const calculateGoalKcal = (tdee: number, goal: Goal, pace: Pace): number => {
  let adjustment = 0;
  
  if (goal === Goal.LOSE) {
    switch (pace) {
      case Pace.RELAXED: adjustment = -250; break;
      case Pace.NORMAL: adjustment = -500; break;
      case Pace.AGGRESSIVE: adjustment = -750; break;
    }
  } else if (goal === Goal.GAIN) {
    switch (pace) {
      case Pace.RELAXED: adjustment = 250; break;
      case Pace.NORMAL: adjustment = 500; break;
      case Pace.AGGRESSIVE: adjustment = 750; break;
    }
  }
  
  return Math.round(tdee + adjustment);
};

export const calculateStepBurn = (steps: number, weightKg: number): number => {
  // Simplified burn factor: roughly 0.04 - 0.06 kcal per step for 70-80kg adult
  // Weight scaled formula
  return Math.round(steps * (weightKg * 0.0006));
};
