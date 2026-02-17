
import React, { useState } from 'react';
import { Input } from './common/Input';
import { Gender, Goal, Pace, UserProfile, OnboardingAnswers } from '../types';
import { calculateBMR, calculateTDEE, calculateGoalKcal } from '../services/calculators';
import { ACTIVITY_MULTIPLIERS } from '../constants';
import { ChevronRight, ChevronLeft, Check, User, Activity, Target, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (data.age < 10 || data.age > 90) newErrors.age = "Must be between 10-90";
    if (data.heightCm < 120 || data.heightCm > 220) newErrors.heightCm = "Range: 120-220 cm";
    if (data.weightKg < 35 || data.weightKg > 200) newErrors.weightKg = "Range: 35-200 kg";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const calculateResults = () => {
    const baseMult = ACTIVITY_MULTIPLIERS[data.jobType];
    const exerciseBonus = (data.exerciseDays * (data.workoutDuration / 60) * 0.1) / 7;
    const finalMultiplier = baseMult + exerciseBonus;
    
    let baseSteps = data.jobType === 'desk' ? 3000 : data.jobType === 'standing' ? 6000 : 9000;
    if (data.commute === 'public') baseSteps += 1500;
    if (data.commute === 'walk_bike') baseSteps += 4000;
    const finalSteps = baseSteps + (data.exerciseDays * 1000 / 7);

    const bmr = calculateBMR(data.weightKg, data.heightCm, data.age, data.gender);
    const tdee = calculateTDEE(bmr, finalMultiplier);
    const targetKcal = calculateGoalKcal(tdee, data.goal, data.pace);
    
    return { multiplier: finalMultiplier, steps: Math.round(finalSteps), targetKcal: Math.round(targetKcal) };
  };

  const results = calculateResults();

  const handleSubmit = () => {
    onComplete({
      ...data,
      activityMultiplier: results.multiplier,
      baselineSteps: results.steps,
      targetKcal: results.targetKcal,
      targetWaterMl: Math.round(data.weightKg * 35),
      targetSteps: results.steps,
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
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-10 pt-16">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-3xl"><User size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Basic Profile</h2>
              </div>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {Object.values(Gender).map(g => (
                  <button 
                    key={g}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${data.gender === g ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400'}`}
                    onClick={() => setData({ ...data, gender: g })}
                  >{g}</button>
                ))}
              </div>

              <div className="grid gap-6">
                <Input label="How old are you?" type="number" value={data.age} error={errors.age} onChange={(e) => setData({...data, age: Number(e.target.value)})} />
                <div className="flex gap-4">
                  <Input label="Height (cm)" type="number" value={data.heightCm} error={errors.heightCm} onChange={(e) => setData({...data, heightCm: Number(e.target.value)})} />
                  <Input label="Weight (kg)" type="number" value={data.weightKg} error={errors.weightKg} onChange={(e) => setData({...data, weightKg: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-3xl"><Activity size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight text-center">Your Lifestyle</h2>
              </div>

              <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-2 no-scrollbar">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['desk', 'standing', 'walking', 'physical'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setData({...data, jobType: type as any})}
                        className={`p-4 rounded-2xl border-2 text-xs font-bold capitalize transition-all ${data.jobType === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200'}`}
                      >{type}</button>
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

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Average Commute</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'car', label: 'Car' },
                      { id: 'public', label: 'Transit' },
                      { id: 'walk_bike', label: 'Active' },
                    ].map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setData({...data, commute: c.id as any})}
                        className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${data.commute === c.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}
                      >{c.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl"><Target size={32} /></div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Set Your Path</h2>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[Goal.LOSE, Goal.MAINTAIN, Goal.GAIN].map(g => (
                  <button 
                    key={g}
                    onClick={() => setData({...data, goal: g})}
                    className={`py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${data.goal === g ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >{g}</button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Difficulty / Pace</p>
                <div className="flex gap-2">
                  {[Pace.RELAXED, Pace.NORMAL, Pace.AGGRESSIVE].map(p => (
                    <button 
                      key={p}
                      onClick={() => setData({...data, pace: p})}
                      className={`flex-1 p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${data.pace === p ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 shadow-md' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-indigo-500/10 space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-500 rounded-2xl text-white"><Sparkles size={20} /></div>
                   <h3 className="text-sm font-black uppercase tracking-wider">Estimated Target</h3>
                 </div>
                 <div className="flex justify-between items-end border-t border-white/10 pt-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase">Daily Limit</div>
                      <div className="text-3xl font-black text-indigo-400">{results.targetKcal} <span className="text-xs">kcal</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase">Step Goal</div>
                      <div className="text-xl font-black text-emerald-400">{results.steps} <span className="text-xs">/ day</span></div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button onClick={prevStep} className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:scale-105 transition-all"><ChevronLeft size={24} /></button>
            )}
            <button 
              onClick={step === 3 ? handleSubmit : nextStep}
              className="flex-1 bg-indigo-600 text-white p-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-xs"
            >
              {step === 3 ? <>Unlock Plan <Check size={20} /></> : <>Continue <ChevronRight size={20} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
