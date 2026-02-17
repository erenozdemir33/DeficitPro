
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, DailyLog, LoggedFood } from '../types';
import { getDayLog, updateDayLog } from '../services/storage';
import { calculateStepBurn } from '../services/calculators';
import { Plus, Droplets, Footprints, Lock, Unlock, X, ChevronRight } from 'lucide-react';
import { FoodCatalogModal } from './FoodCatalogModal';

interface DashboardProps {
  profile: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [refreshKey, setRefreshKey] = useState(0);

  const log = useMemo(() => getDayLog(selectedDate), [selectedDate, refreshKey]);
  
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
    setRefreshKey(prev => prev + 1);
  };

  const removeFood = (foodId: string) => {
    const updatedLog = { ...log, meals: log.meals.filter(m => m.id !== foodId) };
    updateDayLog(selectedDate, updatedLog);
    setRefreshKey(prev => prev + 1);
  };

  const addWater = (amount: number) => {
    if (log.isLocked) return;
    const updatedLog = { ...log, water: [...log.water, { amount, timestamp: Date.now() }] };
    updateDayLog(selectedDate, updatedLog);
    setRefreshKey(prev => prev + 1);
  };

  const updateSteps = (steps: number) => {
    if (log.isLocked) return;
    updateDayLog(selectedDate, { ...log, steps });
    setRefreshKey(prev => prev + 1);
  };

  const toggleLock = () => {
    updateDayLog(selectedDate, { ...log, isLocked: !log.isLocked });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="pb-12 max-w-lg mx-auto transition-all">
      <div className="bg-white dark:bg-slate-900 px-4 py-3 shadow-sm sticky top-[61px] z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-2 px-1">
          {dates.map((d) => {
            const dayLog = getDayLog(d);
            const intake = dayLog.meals.reduce((sum, m) => sum + m.kcal, 0);
            const statusColor = intake <= profile.targetKcal ? 'bg-emerald-500/20 text-emerald-600' : 'bg-red-500/20 text-red-600';
            const isSelected = d === selectedDate;
            return (
              <button 
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 w-12 py-2.5 rounded-[20px] flex flex-col items-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                  {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs font-black">{new Date(d).getDate()}</span>
                {!isSelected && <div className={`w-1 h-1 rounded-full mt-1.5 ${statusColor}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden relative group transition-all">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Energy Balance</h2>
              <div className={`text-6xl font-black tracking-tighter transition-all ${remainingKcal >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                {Math.round(remainingKcal)}
                <span className="text-xl font-bold ml-2 text-slate-300 dark:text-slate-600 tracking-normal">left</span>
              </div>
            </div>
            <button onClick={toggleLock} className={`p-4 rounded-[24px] transition-all shadow-sm ${log.isLocked ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600'}`}>
              {log.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-50 dark:border-slate-800">
            <div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1.5">Intake</div>
              <div className="font-black text-slate-700 dark:text-slate-200">{Math.round(totalIntake)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1.5">Burned</div>
              <div className="font-black text-emerald-500">-{Math.round(stepBurn)}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1.5">Target</div>
              <div className="font-black text-slate-700 dark:text-slate-200">{profile.targetKcal}</div>
            </div>
          </div>
        </div>

        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(mealType => (
          <div key={mealType} className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight flex items-center gap-3">
                {mealType}
                <span className="text-[9px] font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full tracking-wider uppercase">
                  {Math.round(log.meals.filter(m => m.mealType === mealType).reduce((s, m) => s + m.kcal, 0))} kcal
                </span>
              </h3>
              {!log.isLocked && (
                <button onClick={() => { setActiveMealType(mealType); setIsCatalogOpen(true); }} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-2xl hover:scale-110 active:scale-90 transition-all">
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {log.meals.filter(m => m.mealType === mealType).map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] flex justify-between items-center shadow-sm border border-slate-50 dark:border-slate-800 group hover:border-indigo-100 dark:hover:border-indigo-800 transition-all animate-in slide-in-from-right-4">
                  <div className="flex-1">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm">{m.name}</div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{m.grams}g • {m.kcal} kcal</div>
                  </div>
                  {!log.isLocked && (
                    <button onClick={() => removeFood(m.id)} className="text-slate-200 dark:text-slate-800 hover:text-rose-500 dark:hover:text-rose-400 transition-all ml-4">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              {log.meals.filter(m => m.mealType === mealType).length === 0 && (
                <div className="text-center py-8 text-slate-300 dark:text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-50 dark:border-slate-800/50 rounded-[28px] opacity-60">
                  Empty Log
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-2xl shadow-sm"><Droplets size={22} /></div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Hydration</h3>
            </div>
            <div className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">{totalWater} / {profile.targetWaterMl} ml</div>
          </div>
          <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-8 overflow-hidden p-1">
            <div className="h-full bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (totalWater / profile.targetWaterMl) * 100)}%` }} />
          </div>
          {!log.isLocked && (
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map(amt => (
                <button key={amt} onClick={() => addWater(amt)} className="py-3 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl text-[10px] font-black hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all">
                  +{amt}ml
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl shadow-sm"><Footprints size={22} /></div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Step Tracking</h3>
            </div>
            <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{log.steps} / {profile.targetSteps}</div>
          </div>
          <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-8 overflow-hidden p-1">
            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (log.steps / profile.targetSteps) * 100)}%` }} />
          </div>
          {!log.isLocked && (
            <div className="relative group">
              <input type="number" placeholder="Enter manual count..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4.5 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/10 transition-all" value={log.steps || ''} onChange={(e) => updateSteps(Number(e.target.value))} />
            </div>
          )}
        </div>
      </div>

      {isCatalogOpen && (
        <FoodCatalogModal mealType={activeMealType} onClose={() => setIsCatalogOpen(false)} onAdd={handleAddFood} />
      )}
    </div>
  );
};
