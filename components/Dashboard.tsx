
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog, LoggedFood } from '../types';
import { getDayLog, updateDayLog } from '../services/storage';
import { calculateStepBurn } from '../services/calculators';
import { Plus, Droplets, Footprints, Lock, Unlock, X, Flame, Zap, Sparkles } from 'lucide-react';
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
    <div className="pb-12 max-w-lg mx-auto transition-all animate-in fade-in duration-500">
      {/* 7-Day Calendar Strip */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm sticky top-[61px] z-20 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center overflow-x-auto no-scrollbar gap-2 px-1">
          {dates.map((d) => {
            const dayLog = getDayLog(d);
            const intake = dayLog.meals.reduce((sum, m) => sum + m.kcal, 0);
            const statusColor = dayLog.meals.length === 0 ? 'bg-slate-100' : (intake <= profile.targetKcal ? 'bg-emerald-500/20' : 'bg-rose-500/20');
            const isSelected = d === selectedDate;
            return (
              <button 
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 w-12 py-3 rounded-[22px] flex flex-col items-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                  {new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs font-black">{new Date(d).getDate()}</span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white' : statusColor}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-8 mt-2">
        {/* Calorie Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Daily Energy</h2>
              <div className={`text-6xl font-black tracking-tighter transition-all ${remainingKcal >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                {Math.round(remainingKcal)}
                <span className="text-xl font-bold ml-2 text-slate-300 dark:text-slate-600 tracking-normal uppercase">rem.</span>
              </div>
            </div>
            <button onClick={toggleLock} className={`p-4 rounded-[26px] transition-all shadow-sm ${log.isLocked ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600'}`}>
              {log.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-1">
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Intake</div>
              <div className="text-lg font-black text-slate-700 dark:text-slate-200">{Math.round(totalIntake)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Burned</div>
              <div className="text-lg font-black text-emerald-500">-{Math.round(stepBurn)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Target</div>
              <div className="text-lg font-black text-slate-700 dark:text-slate-200">{profile.targetKcal}</div>
            </div>
          </div>
          
          {log.isLocked && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="bg-amber-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <Lock size={12}/> Day Finalized
              </div>
            </div>
          )}
        </div>

        {/* Meal Sections */}
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(mealType => (
          <div key={mealType} className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight">{mealType}</h3>
                <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full uppercase">
                  {Math.round(log.meals.filter(m => m.mealType === mealType).reduce((s, m) => s + m.kcal, 0))} kcal
                </span>
              </div>
              {!log.isLocked && (
                <button onClick={() => { setActiveMealType(mealType); setIsCatalogOpen(true); }} className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                  <Plus size={18} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {log.meals.filter(m => m.mealType === mealType).map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] flex justify-between items-center shadow-sm border border-slate-50 dark:border-slate-800 group hover:border-indigo-100 transition-all animate-in slide-in-from-right-4">
                  <div className="flex-1">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">{m.name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.grams}g • {m.kcal} kcal</div>
                  </div>
                  {!log.isLocked && (
                    <button onClick={() => removeFood(m.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-all ml-4">
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              {log.meals.filter(m => m.mealType === mealType).length === 0 && (
                <div className="text-center py-10 text-slate-300 dark:text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] border-2 border-dashed border-slate-50 dark:border-slate-800/50 rounded-[32px] opacity-60">
                  Log Entry
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Water Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-[22px]"><Droplets size={22} /></div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Hydration</h3>
            </div>
            <div className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{totalWater} / {profile.targetWaterMl}ml</div>
          </div>
          
          <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-10 overflow-hidden p-1 shadow-inner">
            <div className="h-full bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (totalWater / profile.targetWaterMl) * 100)}%` }} />
          </div>

          {!log.isLocked && (
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map(amt => (
                <button key={amt} onClick={() => addWater(amt)} className="py-4 bg-sky-50 dark:bg-sky-900/30 text-sky-600 font-black rounded-[24px] text-[10px] uppercase hover:bg-sky-500 hover:text-white transition-all border border-transparent hover:border-sky-400">
                  +{amt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Steps Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-[22px]"><Footprints size={22} /></div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Activity</h3>
            </div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{log.steps} / {profile.targetSteps}</div>
          </div>

          <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-10 overflow-hidden p-1 shadow-inner">
            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (log.steps / profile.targetSteps) * 100)}%` }} />
          </div>

          {!log.isLocked && (
            <div className="relative">
              <Footprints className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="number" placeholder="Enter step count..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] pl-16 pr-8 py-5 text-sm font-black text-slate-800 dark:text-slate-100 focus:ring-4 focus:ring-emerald-500/10 transition-all" value={log.steps || ''} onChange={(e) => updateSteps(Number(e.target.value))} />
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
