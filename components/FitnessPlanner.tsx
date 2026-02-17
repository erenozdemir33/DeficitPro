
import React, { useState } from 'react';
import { WorkoutPlan, ExerciseEntry } from '../types';
import { updateWorkoutPlan } from '../services/storage';
import { Plus, Trash2, ChevronUp, ChevronDown, Dumbbell } from 'lucide-react';
import { DAYS_OF_WEEK } from '../constants';

interface FitnessPlannerProps {
  plan: WorkoutPlan;
  onUpdate: (plan: WorkoutPlan) => void;
}

export const FitnessPlanner: React.FC<FitnessPlannerProps> = ({ plan, onUpdate }) => {
  const [activeDay, setActiveDay] = useState('Monday');

  const addExercise = () => {
    const newEx: ExerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Exercise',
      sets: 3,
      reps: 10,
    };
    const newPlan = { ...plan, [activeDay]: [...plan[activeDay], newEx] };
    onUpdate(newPlan);
    updateWorkoutPlan(newPlan);
  };

  const removeExercise = (id: string) => {
    const newPlan = { ...plan, [activeDay]: plan[activeDay].filter(e => e.id !== id) };
    onUpdate(newPlan);
    updateWorkoutPlan(newPlan);
  };

  const updateEntry = (id: string, updates: Partial<ExerciseEntry>) => {
    const newPlan = { 
      ...plan, 
      [activeDay]: plan[activeDay].map(e => e.id === id ? { ...e, ...updates } : e) 
    };
    onUpdate(newPlan);
    updateWorkoutPlan(newPlan);
  };

  return (
    <div className="p-4 space-y-8 pb-24 max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-3 pt-6">
        <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[32px] shadow-sm">
          <Dumbbell size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Fitness Routine</h2>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${activeDay === day ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800'}`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {plan[activeDay].map(ex => (
          <div key={ex.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-all">
            <div className="flex justify-between items-start gap-4">
              <input 
                className="flex-1 font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-lg placeholder-slate-300 dark:placeholder-slate-700"
                value={ex.name}
                onChange={(e) => updateEntry(ex.id, { name: e.target.value })}
              />
              <button onClick={() => removeExercise(ex.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sets</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 border dark:border-slate-700">
                  <button onClick={() => updateEntry(ex.id, { sets: Math.max(1, ex.sets - 1) })} className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><ChevronDown size={14} /></button>
                  <span className="flex-1 text-center font-black text-slate-700 dark:text-slate-200">{ex.sets}</span>
                  <button onClick={() => updateEntry(ex.id, { sets: ex.sets + 1 })} className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><ChevronUp size={14} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reps</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1.5 border dark:border-slate-700">
                  <button onClick={() => updateEntry(ex.id, { reps: Math.max(1, ex.reps - 1) })} className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><ChevronDown size={14} /></button>
                  <span className="flex-1 text-center font-black text-slate-700 dark:text-slate-200">{ex.reps}</span>
                  <button onClick={() => updateEntry(ex.id, { reps: ex.reps + 1 })} className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400"><ChevronUp size={14} /></button>
                </div>
              </div>
            </div>

            <textarea
              className="w-full text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              placeholder="Add details (e.g., equipment used, rest time...)"
              rows={2}
              value={ex.notes || ''}
              onChange={(e) => updateEntry(ex.id, { notes: e.target.value })}
            />
          </div>
        ))}

        <button 
          onClick={addExercise}
          className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] text-slate-400 dark:text-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 hover:text-indigo-500 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 transition-all">
            <Plus size={28} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">New Exercise</span>
        </button>
      </div>
    </div>
  );
};
