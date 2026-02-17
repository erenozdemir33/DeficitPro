
import React, { useState } from 'react';
import { WorkoutPlan, ExerciseEntry } from '../types';
import { updateWorkoutPlan } from '../services/storage';
import { Plus, Trash2, ChevronUp, ChevronDown, Dumbbell, CalendarDays } from 'lucide-react';
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
    const newPlan = { ...plan, [activeDay]: [...(plan[activeDay] || []), newEx] };
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
    <div className="p-4 space-y-8 pb-32 max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-4 pt-10">
        <div className="p-5 bg-indigo-600 text-white rounded-[32px] shadow-2xl shadow-indigo-500/30">
          <Dumbbell size={36} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Workout Plan</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Week of Performance</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-2 rounded-[28px] border dark:border-slate-800 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-1 py-1 snap-x">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-8 py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 snap-center ${activeDay === day ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-transparent text-slate-400 dark:text-slate-600 hover:text-indigo-400'}`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {plan[activeDay]?.map(ex => (
          <div key={ex.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 group hover:shadow-xl transition-all animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-start gap-6">
              <input className="flex-1 font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-xl placeholder-slate-200 dark:placeholder-slate-800 transition-all" value={ex.name} onChange={(e) => updateEntry(ex.id, { name: e.target.value })} placeholder="Exercise name..." />
              <button onClick={() => removeExercise(ex.id)} className="text-slate-200 dark:text-slate-800 hover:text-rose-500 transition-all">
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] pl-1">Total Sets</label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 border dark:border-slate-800">
                  <button onClick={() => updateEntry(ex.id, { sets: Math.max(1, ex.sets - 1) })} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600"><ChevronDown size={14} /></button>
                  <span className="flex-1 text-center font-black text-slate-700 dark:text-slate-200 text-lg">{ex.sets}</span>
                  <button onClick={() => updateEntry(ex.id, { sets: ex.sets + 1 })} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600"><ChevronUp size={14} /></button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] pl-1">Reps per set</label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 border dark:border-slate-800">
                  <button onClick={() => updateEntry(ex.id, { reps: Math.max(1, ex.reps - 1) })} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600"><ChevronDown size={14} /></button>
                  <span className="flex-1 text-center font-black text-slate-700 dark:text-slate-200 text-lg">{ex.reps}</span>
                  <button onClick={() => updateEntry(ex.id, { reps: ex.reps + 1 })} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600"><ChevronUp size={14} /></button>
                </div>
              </div>
            </div>

            <textarea className="w-full text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800" placeholder="Notes (rest time, equipment...)" rows={2} value={ex.notes || ''} onChange={(e) => updateEntry(ex.id, { notes: e.target.value })} />
          </div>
        ))}

        <button onClick={addExercise} className="w-full py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] text-slate-400 dark:text-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 hover:text-indigo-500 transition-all flex flex-col items-center gap-4 group">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900 transition-all group-hover:scale-110">
            <Plus size={32} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add Exercise</span>
        </button>
      </div>
    </div>
  );
};
