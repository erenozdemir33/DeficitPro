
import React, { useState, useMemo } from 'react';
import { FoodItem, LoggedFood } from '../types';
import { FOOD_CATALOG } from '../constants';
import { Search, X, Check, Utensils, Info, Zap, ChevronRight } from 'lucide-react';

interface FoodCatalogModalProps {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  onClose: () => void;
  onAdd: (food: LoggedFood) => void;
}

export const FoodCatalogModal: React.FC<FoodCatalogModalProps> = ({ mealType, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [refineItem, setRefineItem] = useState<FoodItem | null>(null);
  
  // Refinement states
  const [grams, setGrams] = useState<number>(0);
  const [fatLevel, setFatLevel] = useState<'Light' | 'Standard' | 'Oily'>('Standard');
  const [sauceLevel, setSauceLevel] = useState<'None' | 'Light' | 'Heavy'>('None');
  const [origin, setOrigin] = useState<'Home-made' | 'Standard' | 'Restaurant'>('Standard');
  const [extras, setExtras] = useState<'None' | 'Bread' | 'Soda' | 'Both'>('None');
  const [toppings, setToppings] = useState<'None' | 'Cheese' | 'Nuts' | 'Sauce'>('None');

  const filtered = useMemo(() => {
    if (!search) return FOOD_CATALOG.filter(f => f.category === mealType).slice(0, 40);
    const s = search.toLocaleLowerCase('tr-TR');
    return FOOD_CATALOG.filter(f => 
      f.name.toLocaleLowerCase('tr-TR').includes(s)
    ).slice(0, 40);
  }, [search, mealType]);

  const handleSelect = (item: FoodItem) => {
    setRefineItem(item);
    setGrams(item.defaultGrams);
    setFatLevel('Standard');
    setSauceLevel('None');
    setOrigin('Standard');
    setExtras('None');
    setToppings('None');
  };

  const calculatedKcal = useMemo(() => {
    if (!refineItem) return 0;
    
    // 1. Base portion math
    let baseKcal = (refineItem.kcalPer100g / 100) * grams;

    // 2. Modifiers (Percentage based)
    let multiplier = 1.0;
    if (fatLevel === 'Light') multiplier -= 0.15;
    if (fatLevel === 'Oily') multiplier += 0.30;
    if (origin === 'Restaurant') multiplier += 0.20;
    if (origin === 'Home-made') multiplier -= 0.10;
    
    let total = baseKcal * multiplier;

    // 3. Additive items (Calories based)
    if (sauceLevel === 'Light') total += 50;
    if (sauceLevel === 'Heavy') total += 150;
    
    if (extras === 'Bread') total += 180;
    if (extras === 'Soda') total += 150;
    if (extras === 'Both') total += 330;

    if (toppings === 'Cheese') total += 100;
    if (toppings === 'Nuts') total += 120;
    if (toppings === 'Sauce') total += 80;

    return Math.round(total);
  }, [refineItem, grams, fatLevel, sauceLevel, origin, extras, toppings]);

  const commitAdd = () => {
    if (!refineItem) return;
    
    const refinementTags = [];
    if (fatLevel !== 'Standard') refinementTags.push(fatLevel);
    if (sauceLevel !== 'None') refinementTags.push(`${sauceLevel} Sauce`);
    if (origin !== 'Standard') refinementTags.push(origin);
    if (extras !== 'None') refinementTags.push(`+ ${extras}`);

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      foodId: refineItem.id,
      name: `${refineItem.name}${refinementTags.length ? ` (${refinementTags.join(', ')})` : ''}`,
      kcal: calculatedKcal,
      grams: grams,
      mealType,
      timestamp: Date.now(),
      refinement: { fatType: fatLevel, origin }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[40px] sm:rounded-[48px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/5 animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Utensils size={20} /></div>
             <h2 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">
               {refineItem ? 'Refine Estimate' : `Add ${mealType}`}
             </h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-8 no-scrollbar pb-32">
          {!refineItem ? (
            <>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input autoFocus className="w-full bg-slate-100 dark:bg-slate-800 rounded-3xl py-5 pl-16 pr-8 text-sm font-black text-slate-700 dark:text-slate-200 border-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Search Simit, Köfte, Mantı..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="space-y-3">
                {filtered.map(item => (
                  <button key={item.id} onClick={() => handleSelect(item)} className="w-full text-left p-6 bg-white dark:bg-slate-800/40 border-2 border-slate-50 dark:border-slate-800 rounded-[32px] flex justify-between items-center hover:border-indigo-500 group transition-all">
                    <div>
                      <div className="font-black text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.householdMeasure} • ~{item.defaultGrams}g</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl">
                        {Math.round((item.kcalPer100g / 100) * item.defaultGrams)} <span className="text-[10px] uppercase ml-0.5">kcal</span>
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-bottom-6">
              {/* Summary Card */}
              <div className="p-8 bg-indigo-600 rounded-[44px] shadow-2xl shadow-indigo-500/30 text-white border border-indigo-500 flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-black text-lg leading-tight">{refineItem.name}</h3>
                  <div className="flex items-center gap-2 opacity-70"><Info size={12}/> <span className="text-[9px] font-black uppercase tracking-widest">Calculated Nutrition</span></div>
                </div>
                <div className="text-5xl font-black text-right">{calculatedKcal} <div className="text-[10px] opacity-60 uppercase">calories</div></div>
              </div>

              {/* Questions Grid */}
              <div className="space-y-10">
                {/* 1. Portion */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">1. Exact Grams Consumed</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 200, 300].map(v => (
                      <button key={v} onClick={() => setGrams(v)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${grams === v ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>
                        {v}g
                      </button>
                    ))}
                  </div>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 text-sm font-black border-none focus:ring-4 focus:ring-indigo-500/10" value={grams || ''} onChange={(e) => setGrams(Number(e.target.value))} placeholder="Manual gram entry..." />
                </div>

                {/* 2. Fat Level */}
                <div className="space-y-5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">2. Cooking Fat / Oil Level</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['Light', 'Standard', 'Oily'] as const).map(f => (
                       <button key={f} onClick={() => setFatLevel(f)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${fatLevel === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>{f}</button>
                     ))}
                   </div>
                </div>

                {/* 3. Sauce */}
                <div className="space-y-5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">3. Sauce / Cream Amount</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['None', 'Light', 'Heavy'] as const).map(s => (
                       <button key={s} onClick={() => setSauceLevel(s)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${sauceLevel === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>{s}</button>
                     ))}
                   </div>
                </div>

                {/* 4. Origin */}
                <div className="space-y-5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">4. Preparation Origin</label>
                   <div className="grid grid-cols-3 gap-2">
                     {(['Home-made', 'Standard', 'Restaurant'] as const).map(o => (
                       <button key={o} onClick={() => setOrigin(o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${origin === o ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>{o}</button>
                     ))}
                   </div>
                </div>

                {/* 5. Extras */}
                <div className="space-y-5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">5. Side Extras</label>
                   <div className="grid grid-cols-4 gap-2">
                     {(['None', 'Bread', 'Soda', 'Both'] as const).map(ex => (
                       <button key={ex} onClick={() => setExtras(ex)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${extras === ex ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>{ex}</button>
                     ))}
                   </div>
                </div>

                {/* 6. Toppings */}
                <div className="space-y-5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">6. Add Toppings / Cheese</label>
                   <div className="grid grid-cols-4 gap-2">
                     {(['None', 'Cheese', 'Nuts', 'Sauce'] as const).map(t => (
                       <button key={t} onClick={() => setToppings(t)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${toppings === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>{t}</button>
                     ))}
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t dark:border-slate-800 flex gap-4">
                <button onClick={() => setRefineItem(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-3xl uppercase tracking-widest text-[10px]">Back</button>
                <button onClick={commitAdd} className="flex-[2] bg-indigo-600 text-white font-black rounded-3xl shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">
                  Log Entry <Check size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
