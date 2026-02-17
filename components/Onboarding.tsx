
import React, { useState } from 'react';
import { Input } from './common/Input';
import { Gender, Goal, Pace, UserProfile, OnboardingAnswers } from '../types';
import { calculateBMR, calculateTDEE, calculateGoalKcal, calculateBMI, getBMICategory, calculateMacroTargets } from '../services/calculators';
import { ACTIVITY_MULTIPLIERS } from '../constants';
import { ChevronRight, ChevronLeft, Check, User, Activity, Target, Sparkles, ShieldAlert, Scale, Info } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // Step 0: Intro
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [data, setData] = useState({
    gender: Gender.MALE,
    age: 25,
    heightCm: 175,
    weightKg: 75,
    jobType: 'desk' as OnboardingAnswers['jobType'],
    commute: 'car' as OnboardingAnswers['commute'],
    exerciseDays: 3,
    workoutDuration: 45,
    weekendActivity: 'moderate' as OnboardingAnswers['weekendActivity'],
    goal: Goal.LOSE,
    pace: Pace.NORMAL,
  });

  const bmi = calculateBMI(data.weightKg, data.heightCm);
  const bmiCat = getBMICategory(bmi);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!data.age || data.age < 10 || data.age > 90) newErrors.age = "Must be between 10-90";
    if (!data.heightCm || data.heightCm < 120 || data.heightCm > 220) newErrors.heightCm = "Range: 120-220 cm";
    if (!data.weightKg || data.weightKg < 35 || data.weightKg > 200) newErrors.weightKg = "Range: 35-200 kg";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 2 && !validateStep1()) return;
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const calculateFinalPlan = () => {
    const baseMult = ACTIVITY_MULTIPLIERS[data.jobType];
    const exerciseBonus = (data.exerciseDays * (data.workoutDuration / 60) * 0.12) / 7;
    const finalMultiplier = baseMult + exerciseBonus;
    
    let baseSteps = data.jobType === 'desk' ? 3500 : data.jobType === 'standing' ? 6500 : 9500;
    if (data.commute === 'public') baseSteps += 1500;
    if (data.commute === 'walk_bike') baseSteps += 4500;
    const finalSteps = Math.round(baseSteps + (data.exerciseDays * 1200 / 7));

    const bmr = calculateBMR(data.weightKg, data.heightCm, data.age, data.gender);
    const tdee = calculateTDEE(bmr, finalMultiplier);
    const targetKcal = calculateGoalKcal(tdee, data.goal, data.pace);
    const macros = calculateMacroTargets(targetKcal, data.weightKg, data.goal);
    const water = Math.round(data.weightKg * 35);

    return { multiplier: finalMultiplier, steps: finalSteps, targetKcal, macros, water };
  };

  const plan = calculateFinalPlan();

  const handleSubmit = () => {
    onComplete({
      ...data,
      bmi,
      bmiCategory: bmiCat,
      activityMultiplier: plan.multiplier,
      baselineSteps: plan.steps,
      targetKcal: plan.targetKcal,
      targetWaterMl: plan.water,
      targetSteps: plan.steps,
      macroTargets: plan.macros,
      onboardingComplete: true,
      onboardingAnswers: {
        jobType: data.jobType,
        commute: data.commute,
        exerciseDays: data.exerciseDays,
        workoutDuration: data.workoutDuration,
        weekendActivity: data.weekendActivity
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl w-full max-w-lg overflow-hidden relative border border-white dark:border-slate-800 transition-colors">
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full absolute top-0">
          <div 
            className="h-full bg-indigo-500 transition-all duration-700 ease-out" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="p-8 pt-12 md:p-10 md:pt-16">
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500 text-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/30">
                <Sparkles size={48} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">Welcome to DeficitPro</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  We use dietitian-standard math to calculate your metabolic targets. No guesswork, just science-backed progress.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left">
                   <div className="text-indigo-600 mb-2"><Activity size={20} /></div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Metabolic Plan</h4>
                   <p className="text-[10px] text-slate-400 mt-1">Personalized calorie & macro targets.</p>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left">
                   <div className="text-emerald-600 mb-2"><Target size={20} /></div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Trend Tracking</h4>
                   <p className="text-[10px] text-slate-400 mt-1">Deep insights into your habits.</p>
                 </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-3xl"><Scale size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Biology First</h2>
                <p className="text-center text-sm text-slate-500">Your gender and age help us estimate your Basal Metabolic Rate (BMR).</p>
              </div>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {Object.values(Gender).map(g => (
                  <button 
                    key={g}
                    className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${data.gender === g ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400'}`}
                    onClick={() => setData({ ...data, gender: g })}
                  >{g}</button>
                ))}
              </div>

              <div className="grid gap-6">
                <Input label="Your Age" type="number" placeholder="25" value={data.age || ''} error={errors.age} onChange={(e) => setData({...data, age: Number(e.target.value)})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-3xl"><Scale size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Size & Form</h2>
              </div>

              <div className="grid gap-6">
                <Input label="Height (cm)" type="number" placeholder="180" value={data.heightCm || ''} error={errors.heightCm} onChange={(e) => setData({...data, heightCm: Number(e.target.value)})} />
                <Input label="Weight (kg)" type="number" placeholder="80" value={data.weightKg || ''} error={errors.weightKg} onChange={(e) => setData({...data, weightKg: Number(e.target.value)})} />
              </div>

              {data.heightCm > 0 && data.weightKg > 0 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400">BMI Analysis</h4>
                    <div className="text-xl font-black text-slate-800 dark:text-white">{bmi} <span className="text-xs font-bold text-slate-400">kg/m²</span></div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${bmiCat === 'Normal weight' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {bmiCat}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-3xl"><Activity size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Energy Output</h2>
              </div>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Activity</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['desk', 'standing', 'walking', 'physical'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setData({...data, jobType: type as any})}
                        className={`p-4 rounded-2xl border-2 text-xs font-bold capitalize transition-all ${data.jobType === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}
                      >{type}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Commute Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['car', 'public', 'walk_bike'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setData({...data, commute: c as any})}
                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${data.commute === c ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}
                      >{c.replace('_', ' & ')}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Workout Frequency (Days/Week)</p>
                  <div className="flex justify-between gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button 
                        key={d}
                        onClick={() => setData({...data, exerciseDays: d})}
                        className={`flex-1 h-10 rounded-xl text-xs font-black transition-all ${data.exerciseDays === d ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl"><Target size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Your Goal</h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[Goal.LOSE, Goal.MAINTAIN, Goal.GAIN].map(g => (
                  <button 
                    key={g}
                    onClick={() => setData({...data, goal: g})}
                    className={`py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${data.goal === g ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >{g}</button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sustainability & Pace</p>
                <div className="flex gap-2">
                  {[Pace.RELAXED, Pace.NORMAL, Pace.AGGRESSIVE].map(p => (
                    <button 
                      key={p}
                      onClick={() => setData({...data, pace: p})}
                      className={`flex-1 p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${data.pace === p ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                    >{p}</button>
                  ))}
                </div>
                {data.pace === Pace.AGGRESSIVE && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex gap-3 items-center">
                    <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-tight">Citing WHO: Rapid loss can cause metabolic slowdown. Monitor energy levels!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">Your Plan</h2>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">Calculated for {bmiCat} range</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl col-span-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Energy Budget</div>
                  <div className="text-4xl font-black text-indigo-400">{plan.targetKcal} <span className="text-sm">kcal / day</span></div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px]">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity Goal</div>
                  <div className="text-xl font-black text-emerald-500">{plan.steps} <span className="text-[10px]">steps</span></div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px]">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hydration</div>
                  <div className="text-xl font-black text-sky-500">{plan.water} <span className="text-[10px]">ml</span></div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-6 rounded-[32px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Macro Breakdown</p>
                 <div className="flex gap-4">
                    <div className="flex-1 text-center"><div className="text-sm font-black text-slate-700 dark:text-slate-100">{plan.macros.protein}g</div><div className="text-[8px] font-black text-slate-400 uppercase">Protein</div></div>
                    <div className="flex-1 text-center"><div className="text-sm font-black text-slate-700 dark:text-slate-100">{plan.macros.carbs}g</div><div className="text-[8px] font-black text-slate-400 uppercase">Carbs</div></div>
                    <div className="flex-1 text-center"><div className="text-sm font-black text-slate-700 dark:text-slate-100">{plan.macros.fat}g</div><div className="text-[8px] font-black text-slate-400 uppercase">Fats</div></div>
                 </div>
              </div>

              <div className="p-5 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] flex gap-4 items-start">
                 <ShieldAlert className="text-slate-400 shrink-0 mt-1" size={18} />
                 <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                   Disclaimer: This plan is for informational purposes only. Consult a healthcare provider before starting any rigorous diet or exercise routine.
                 </p>
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            {step > 0 && (
              <button onClick={prevStep} className="p-5 rounded-[24px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:scale-105 active:scale-95 transition-all"><ChevronLeft size={24} /></button>
            )}
            <button 
              onClick={step === 5 ? handleSubmit : nextStep}
              className="flex-1 bg-indigo-600 text-white p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-xs"
            >
              {step === 5 ? <>Start My Journey <Check size={20} /></> : <>Next Step <ChevronRight size={20} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
