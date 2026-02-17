
import { AppState, UserProfile, DailyLog, WorkoutPlan, CheckIn } from '../types';

const STORAGE_KEY = 'DEFICITPRO_DATA_V1';

const INITIAL_STATE: AppState = {
  profile: null,
  logs: {},
  workoutPlan: {
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': [],
    'Sunday': [],
  },
  checkIns: [],
};

export const loadState = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_STATE;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse localStorage data', e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const updateProfile = (profile: UserProfile) => {
  const state = loadState();
  state.profile = profile;
  saveState(state);
};

export const getDayLog = (date: string): DailyLog => {
  const state = loadState();
  if (state.logs[date]) return state.logs[date];
  return {
    date,
    meals: [],
    water: [],
    steps: 0,
    isLocked: false,
  };
};

export const updateDayLog = (date: string, log: DailyLog) => {
  const state = loadState();
  state.logs[date] = log;
  saveState(state);
};

export const updateWorkoutPlan = (plan: WorkoutPlan) => {
  const state = loadState();
  state.workoutPlan = plan;
  saveState(state);
};

export const addCheckIn = (checkIn: CheckIn) => {
  const state = loadState();
  state.checkIns.push(checkIn);
  saveState(state);
};
