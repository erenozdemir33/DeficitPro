
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog, LoggedFood } from '../types';
import { getDayLog, updateDayLog } from '../services/storage';
import { calculateStepBurn } from '../services/calculators';
import { Plus, Droplets, Footprints, Lock, Unlock, X } from 'lucide-react';
import { FoodCatalogModal } from './FoodCatalogModal';

interface DashboardProps {
  profile: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');

  const log = useMemo(() => getDayLog(selectedDate), [selectedDate]);
  
  const totalIntake = log.meals.reduce((sum, m) => sum + m.kcal, 0);
  const stepBurn = calculateStepBurn(log.steps, profile.weightKg);
  const netKcal = totalIntake - stepBurn;
  const remainingKcal = profile.targetKcal - netKcal;
  
  const totalWater = log.water.reduce((sum, w) => sum + w.amount, 0);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleAddFood = (food: LoggedFood) => {
    const updatedLog = { ...log, meals: [...log.meals, food] };
    updateDayLog(selectedDate, updatedLog);
    setSelectedDate(selectedDate);
  };

  const removeFood = (foodId: string) => {
    const updatedLog = { ...log, meals: log.meals.filter(m => m.id !== foodId) };
    updateDayLog(selectedDate, updatedLog);
    setSelectedDate(selectedDate);
  };

  const addWater = (amount: number) => {
    if (log.isLocked) return;
    const updatedLog = { ...log, water: [...log.water, { amount, timestamp: Date.now() }] };
    updateDayLog(selectedDate, updatedLog);
    setSelectedDate(selectedDate);
  };

  const updateSteps = (steps: number) => {
    if (log.isLocked) return;
    updateDayLog(selectedDate, { ...log, steps });
    setSelectedDate(selectedDate);
  };

  const toggleLock = () => {
    updateDayLog(selectedDate, { ...log, isLocked: !log.isLocked });
    setSelectedDate(selectedDate);
  };

  return (
    <div className="pb-12 max-w-lg mx-auto">
      {/* Calendar Strip */}
      <div className="bg-white dark:bg-slate-900 px-4 py-3 shadow-sm sticky top-[61px] z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-2">
          {dates.map((d) => {
            const dayLog = getDayLog(d);
            const intake = dayLog.meals.reduce((sum, m) => sum + m.kcal, 0);
            const statusColor = intake <= profile.targetKcal ? 'bg-emerald-500/20 text-emerald-600' : 'bg-red-500/20 text-red-600';
            const isSelected = d === selectedDate;
            return (
              <button 
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 w-11 py-2 rounded-2xl flex flex-col items-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
              >
                <span className="text-[9px] uppercase font-bold opacity-60">
                  {new Date(d).toLocaleDateString('tr-TR', { weekday: 'short' })}
                </span>
                <span className="text-xs font-bold">{new Date(d).getDate()}</span>
                {!isSelected && <div className={`w-1 h-1 rounded-full mt-1 ${statusColor}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Calorie Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Calories Left</h2>
              <div className={`text-5xl font-black tracking-tighter ${remainingKcal >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                {Math.round(remainingKcal)}
              </div>
            </div>
            <button 
              onClick={toggleLock}
              className={`p-3 rounded-2xl transition-all ${log.isLocked ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}
            >
              {log.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Eaten</div>
              <div className="font-black text-slate-700 dark:text-slate-200">{Math.round(totalIntake)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Burned</div>
              <div className="font-black text-emerald-500">{Math.round(stepBurn)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Goal</div>
              <div className="font-black text-slate-700 dark:text-slate-200">{profile.targetKcal}</div>
            </div>
          </div>
        </div>

        {/* Meal Sections */}
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(mealType => (
          <div key={mealType} className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                {mealType}
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
                  {Math.round(log.meals.filter(m => m.mealType === mealType).reduce((s, m) => s + m.kcal, 0))} kcal
                </span>
              </h3>
              {!log.isLocked && (
                <button 
                  onClick={() => { setActiveMealType(mealType); setIsCatalogOpen(true); }}
                  className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl hover:bg-indigo-100 transition-all"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {log.meals.filter(m => m.mealType === mealType).map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{m.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{m.grams}g • {m.kcal} kcal</div>
                  </div>
                  {!log.isLocked && (
                    <button onClick={() => removeFood(m.id)} className="text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              {log.meals.filter(m => m.mealType === mealType).length === 0 && (
                <div className="text-center py-6 text-slate-300 dark:text-slate-800 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 dark:border-slate-900 rounded-[24px]">
                  No Entries
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Hydration Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-2xl">
                <Droplets size={20} />
              </div>
              <h3 className="font-black text-slate-700 dark:text-slate-200">Hydration</h3>
            </div>
            <div className="text-xs font-black text-sky-600 dark:text-sky-400">{totalWater} / {profile.targetWaterMl} ml</div>
          </div>
          <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, (totalWater / profile.targetWaterMl) * 100)}%` }}
            />
          </div>
          {!log.isLocked && (
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => addWater(amt)}
                  className="py-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl text-[10px] font-black hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all"
                >
                  +{amt}ml
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Steps Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl">
                <Footprints size={20} />
              </div>
              <h3 className="font-black text-slate-700 dark:text-slate-200">Activity</h3>
            </div>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{log.steps} / {profile.targetSteps}</div>
          </div>
          <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, (log.steps / profile.targetSteps) * 100)}%` }}
            />
          </div>
          {!log.isLocked && (
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Enter steps today..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
                value={log.steps || ''}
                onChange={(e) => updateSteps(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      {isCatalogOpen && (
        <FoodCatalogModal 
          mealType={activeMealType} 
          onClose={() => setIsCatalogOpen(false)} 
          onAdd={handleAddFood} 
        />
      )}
    </div>
  );
};
