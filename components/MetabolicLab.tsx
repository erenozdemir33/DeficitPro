
import React, { useState } from 'react';
import { UserProfile, DailyLog } from '../types';
import { calculateStepBurn } from '../services/calculators';
import { FlaskConical, TrendingDown, Coffee, UtensilsCrossed, Zap, Info, ChevronRight, Sparkles, Scale } from 'lucide-react';

interface MetabolicLabProps {
  profile: UserProfile;
  logs: Record<string, DailyLog>;
}

export const MetabolicLab: React.FC<MetabolicLabProps> = ({ profile, logs }) => {
  const [extraSteps, setExtraSteps] = useState(2000);
  const [deficitMod, setDeficitMod] = useState(0);

  // Simulation Logic
  const dailyBurn = calculateStepBurn(extraSteps, profile.weightKg);
  const weeklyBurn = (dailyBurn + deficitMod) * 7;
  const fatLossKg = Number((weeklyBurn / 7700).toFixed(2)); // ~7700 kcal per kg of body fat

  const diningHacks = [
    { title: 'The Döner Hack', desc: 'Swap Durum for a plate (Gobit) to save ~250kcal in flour.', tag: 'Lunch' },
    { title: 'Lentil Power', desc: 'Mercimek Corba is your best friend. High satiety, low energy density.', tag: 'Satiety' },
    { title: 'Ayran Buffer', desc: 'Drink 200ml Ayran 10 min before a meal to reduce intake by ~15%.', tag: 'Hack' },
  ];

  return (
    <div className="p-4 space-y-8 pb-32 max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-4 pt-10">
        <div className="p-5 bg-slate-900 text-indigo-400 rounded-[32px] shadow-2xl">
          <FlaskConical size={36} />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">The Lab</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Forecasting & Simulations</p>
        </div>
      </div>

      {/* PROJECTION TOOL */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex items-center gap-3">
          <Sparkles className="text-indigo-500" size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Success Simulator</h3>
        </div>

        <div className="space-y-8">
           <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-slate-400 uppercase">Extra Daily Steps</span>
               <span className="text-sm font-black text-indigo-600">+{extraSteps}</span>
             </div>
             <input type="range" min={0} max={20000} step={500} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600" value={extraSteps} onChange={(e) => setExtraSteps(Number(e.target.value))} />
           </div>

           <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-slate-400 uppercase">Daily Deficit Boost</span>
               <span className="text-sm font-black text-rose-600">-{deficitMod} kcal</span>
             </div>
             <input type="range" min={0} max={1000} step={50} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-600" value={deficitMod} onChange={(e) => setDeficitMod(Number(e.target.value))} />
           </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
           <div className="relative z-10 space-y-1">
             <h4 className="text-[10px] font-black uppercase opacity-70 tracking-widest">Projected Monthly Progress</h4>
             <div className="text-5xl font-black">{(fatLossKg * 4.3).toFixed(1)} <span className="text-sm">kg</span></div>
             <p className="text-[9px] font-bold uppercase opacity-60">Estimated fat loss based on energy flux</p>
           </div>
           <Scale size={80} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-all" />
        </div>
      </div>

      {/* TURKISH DINING HACKS */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <UtensilsCrossed className="text-amber-500" size={18} />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Turkish Dining Hacks</h3>
        </div>
        <div className="grid gap-3">
           {diningHacks.map((hack, idx) => (
             <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex gap-4 items-center group hover:scale-[1.02] transition-all">
               <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                 <Zap size={20} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="text-xs font-black text-slate-800 dark:text-white">{hack.title}</h4>
                   <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full">{hack.tag}</span>
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{hack.desc}</p>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* METABOLIC NOTE */}
      <div className="p-8 bg-slate-900 rounded-[44px] text-white space-y-4">
        <div className="flex items-center gap-3 text-indigo-400">
           <Info size={18} />
           <h4 className="text-[11px] font-black uppercase tracking-widest">Lab Logic</h4>
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          The Lab uses the "First Law of Thermodynamics" (Energy Balance). While hormonal factors matter, net energy flux remains the primary driver of body composition change.
        </p>
      </div>
    </div>
  );
};
