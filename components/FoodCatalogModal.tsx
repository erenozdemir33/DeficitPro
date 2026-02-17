
import React, { useState, useMemo } from 'react';
import { FoodItem, LoggedFood } from '../types';
import { FOOD_CATALOG } from '../constants';
import { Search, X, ChevronRight, Info, Check } from 'lucide-react';

interface FoodCatalogModalProps {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  onClose: () => void;
  onAdd: (food: LoggedFood) => void;
}

export const FoodCatalogModal: React.FC<FoodCatalogModalProps> = ({ mealType, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [refineItem, setRefineItem] = useState<FoodItem | null>(null);
  
  const [grams, setGrams] = useState<number>(0);
  const [fatType, setFatType] = useState<string>('Standard');
  const [origin, setOrigin] = useState<string>('Standard');

  const filtered = useMemo(() => {
    if (!search) return FOOD_CATALOG.filter(f => f.category === mealType).slice(0, 30);
    const s = search.toLocaleLowerCase('tr-TR');
    return FOOD_CATALOG.filter(f => 
      f.name.toLocaleLowerCase('tr-TR').includes(s)
    ).slice(0, 30);
  }, [search, mealType]);

  const handleSelect = (item: FoodItem) => {
    setRefineItem(item);
    setGrams(item.defaultGrams);
    setFatType('Standard');
    setOrigin('Standard');
  };

  const calculatedKcal = useMemo(() => {
    if (!refineItem) return 0;
    let multiplier = 1.0;
    
    // Dietitian logic: Cooking fat & origin impact
    if (fatType === 'Oily') multiplier += 0.15;
    if (fatType === 'Light') multiplier -= 0.10;
    if (origin === 'Restaurant') multiplier += 0.20;
    if (origin === 'Home-made') multiplier -= 0.10;

    return Math.round((refineItem.kcalPer100g / 100) * grams * multiplier);
  }, [refineItem, grams, fatType, origin]);

  const commitAdd = () => {
    if (!refineItem) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      foodId: refineItem.id,
      name: `${refineItem.name}${origin === 'Restaurant' ? ' (Rest.)' : ''}`,
      kcal: calculatedKcal,
      grams: grams,
      mealType,
      timestamp: Date.now(),
      refinement: { fatType, origin }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[40px] sm:rounded-[48px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/10">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="font-black text-slate-800 dark:text-slate-100 text-xl tracking-tight">Add {mealType}</h2>
          <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6 no-scrollbar">
          {!refineItem ? (
            <>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" size={18} />
                <input autoFocus className="w-full bg-slate-100 dark:bg-slate-800 rounded-3xl py-5 pl-16 pr-8 text-sm font-black text-slate-700 dark:text-slate-200 border-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Search (Simit, Köfte, Mantı...)" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="space-y-3">
                {filtered.map(item => (
                  <button key={item.id} onClick={() => handleSelect(item)} className="w-full text-left p-6 bg-white dark:bg-slate-800/40 border-2 border-slate-50 dark:border-slate-800 rounded-[32px] flex justify-between items-center hover:border-indigo-500 dark:hover:border-indigo-500 group transition-all">
                    <div>
                      <div className="font-black text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{item.householdMeasure} • ~{item.defaultGrams}g</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl">
                        {Math.round((item.kcalPer100g / 100) * item.defaultGrams)} <span className="text-[10px] uppercase ml-0.5">kcal</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              <div className="flex justify-between items-center p-8 bg-indigo-600 rounded-[40px] shadow-xl shadow-indigo-500/20 text-white border border-indigo-500 transition-all">
                <div>
                  <h3 className="font-black text-lg">{refineItem.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{refineItem.kcalPer100g} kcal/100g</p>
                </div>
                <div className="text-4xl font-black">{calculatedKcal} <span className="text-sm opacity-60">kcal</span></div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Portion Control (Grams)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 200, 300, 400].map(v => (
                      <button key={v} onClick={() => setGrams(v)} className={`py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${grams === v ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>
                        {v}g
                      </button>
                    ))}
                  </div>
                  <input type="number" className="w-full mt-3 px-6 py-4.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-200 border-none focus:ring-4 focus:ring-indigo-500/10" value={grams} onChange={(e) => setGrams(Number(e.target.value))} />
                </div>

                <div className="space-y-6 bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500 text-white rounded-xl"><Info size={16} /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refine Estimate</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Cooking Fat Level</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Light', 'Standard', 'Oily'].map(f => (
                        <button key={f} onClick={() => setFatType(f)} className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${fatType === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'}`}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Preparation Origin</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home-made', 'Standard', 'Restaurant'].map(o => (
                        <button key={o} onClick={() => setOrigin(o)} className={`py-3 rounded-xl text-[9px] font-black uppercase transition-all ${origin === o ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setRefineItem(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-[28px] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px]">Change Food</button>
                <button onClick={commitAdd} className="flex-[2] bg-indigo-600 text-white font-black rounded-[28px] shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]">
                  Confirm {calculatedKcal} kcal <Check size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
