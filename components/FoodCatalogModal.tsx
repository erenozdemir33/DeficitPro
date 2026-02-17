
import React, { useState, useMemo } from 'react';
import { FoodItem, LoggedFood } from '../types';
import { FOOD_CATALOG } from '../constants';
import { Search, X, ChevronRight, Info } from 'lucide-react';

interface FoodCatalogModalProps {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  onClose: () => void;
  onAdd: (food: LoggedFood) => void;
}

export const FoodCatalogModal: React.FC<FoodCatalogModalProps> = ({ mealType, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [refineItem, setRefineItem] = useState<FoodItem | null>(null);
  
  const [grams, setGrams] = useState<number>(0);
  const [oilAmount, setOilAmount] = useState<number>(0); 
  const [sugarAmount, setSugarAmount] = useState<number>(0);

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
    setOilAmount(0);
    setSugarAmount(0);
  };

  const calculatedKcal = useMemo(() => {
    if (!refineItem) return 0;
    const baseKcal = (refineItem.kcalPer100g / 100) * grams;
    const extraKcal = (oilAmount * 9) + (sugarAmount * 4);
    return Math.round(baseKcal + extraKcal);
  }, [refineItem, grams, oilAmount, sugarAmount]);

  const commitAdd = () => {
    if (!refineItem) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      foodId: refineItem.id,
      name: refineItem.name,
      kcal: calculatedKcal,
      grams: grams,
      mealType,
      timestamp: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-t sm:border border-white/10">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h2 className="font-black text-slate-800 dark:text-slate-100">Add {mealType}</h2>
          <button onClick={onClose} className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 no-scrollbar">
          {!refineItem ? (
            <>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  autoFocus
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Search foods (e.g. Mantı, Simit...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filtered.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.householdMeasure} • ~{item.defaultGrams}g</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {Math.round((item.kcalPer100g / 100) * item.defaultGrams)}
                      </span>
                      <ChevronRight className="text-slate-300 dark:text-slate-700" size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 ease-out">
              <div className="flex justify-between items-center p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-[32px] border border-indigo-100 dark:border-indigo-800">
                <div>
                  <h3 className="font-black text-indigo-900 dark:text-indigo-200 text-lg">{refineItem.name}</h3>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{refineItem.kcalPer100g} kcal/100g</p>
                </div>
                <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300">{calculatedKcal} <span className="text-sm">kcal</span></div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Grams / Serving</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[100, 150, 200, 250].map(v => (
                      <button
                        key={v}
                        onClick={() => setGrams(v)}
                        className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${grams === v ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400'}`}
                      >
                        {v}g
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-indigo-500" 
                      value={grams}
                      onChange={(e) => setGrams(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[32px] space-y-6 border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Added Fats (g)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 5, 10, 15].map(o => (
                        <button
                          key={o}
                          onClick={() => setOilAmount(o)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border-2 ${oilAmount === o ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                        >
                          {o === 0 ? 'None' : `${o}g`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Added Sugar/Sauce (g)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 5, 10, 20].map(s => (
                        <button
                          key={s}
                          onClick={() => setSugarAmount(s)}
                          className={`py-2 rounded-xl text-[10px] font-black transition-all border-2 ${sugarAmount === s ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                        >
                          {s === 0 ? 'None' : `${s}g`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex gap-4 items-start">
                  <Info className="text-indigo-500 dark:text-indigo-400 shrink-0" size={18} />
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                    Adjusting for fats/sugars increases accuracy for traditional Turkish dishes which can vary greatly in preparation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setRefineItem(null)}
                  className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl transition-all"
                >
                  Change Food
                </button>
                <button 
                  onClick={commitAdd}
                  className="flex-[1.5] bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  Add Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
