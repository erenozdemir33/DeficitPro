
import React, { useState } from 'react';
import { Input } from './common/Input';
import { Gender, Goal, Pace, UserProfile } from '../types';
import { calculateBMR, calculateTDEE, calculateGoalKcal } from '../services/calculators';
import { ACTIVITY_MULTIPLIERS } from '../constants';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    gender: Gender.MALE,
    age: 25,
    heightCm: 175,
    weightKg: 75,
    lifestyle: 'DESK',
    goal: Goal.MAINTAIN,
    pace: Pace.NORMAL,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const multiplier = ACTIVITY_MULTIPLIERS[data.lifestyle as keyof typeof ACTIVITY_MULTIPLIERS];
    const bmr = calculateBMR(data.weightKg, data.heightCm, data.age, data.gender);
    const tdee = calculateTDEE(bmr, multiplier);
    const targetKcal = calculateGoalKcal(tdee, data.goal, data.pace);
    
    const baselineSteps = data.lifestyle === 'DESK' ? 4000 : 
                         data.lifestyle === 'STANDING' ? 7000 :
                         data.lifestyle === 'WALKING' ? 10000 : 13000;

    onComplete({
      ...data,
      activityMultiplier: multiplier,
      baselineSteps,
      targetKcal,
      targetWaterMl: 2500,
      targetSteps: baselineSteps,
      onboardingComplete: true,
    });
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="h-2 bg-slate-100 w-full absolute top-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 pt-12">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Tell us about you</h2>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${data.gender === Gender.MALE ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                  onClick={() => setData({ ...data, gender: Gender.MALE })}
                >Male</button>
                <button 
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${data.gender === Gender.FEMALE ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                  onClick={() => setData({ ...data, gender: Gender.FEMALE })}
                >Female</button>
              </div>
              <Input 
                label="Age (10-90)" 
                type="number" 
                value={data.age} 
                onChange={(e) => setData({...data, age: Number(e.target.value)})} 
              />
              <div className="flex gap-4">
                <Input 
                  label="Height (cm)" 
                  type="number" 
                  value={data.heightCm} 
                  onChange={(e) => setData({...data, heightCm: Number(e.target.value)})} 
                />
                <Input 
                  label="Weight (kg)" 
                  type="number" 
                  value={data.weightKg} 
                  onChange={(e) => setData({...data, weightKg: Number(e.target.value)})} 
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Lifestyle & Activity</h2>
              <div className="space-y-3">
                <p className="text-sm text-slate-500 font-medium">How would you describe your typical day?</p>
                {[
                  { id: 'DESK', label: 'Sedentary', desc: 'Mostly sitting (Desk job, Gamer)' },
                  { id: 'STANDING', label: 'Lightly Active', desc: 'On your feet (Teacher, Retail)' },
                  { id: 'WALKING', label: 'Moderately Active', desc: 'Moving often (Server, Nurse)' },
                  { id: 'PHYSICAL', label: 'Very Active', desc: 'Strenuous labor (Construction)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setData({ ...data, lifestyle: item.id })}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${data.lifestyle === item.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="font-bold text-slate-800">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Your Goal</h2>
              <div className="grid grid-cols-3 gap-2">
                {[Goal.LOSE, Goal.MAINTAIN, Goal.GAIN].map((g) => (
                  <button
                    key={g}
                    onClick={() => setData({ ...data, goal: g })}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${data.goal === g ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-slate-500 font-medium">Desired Pace</p>
                {[
                  { id: Pace.RELAXED, label: 'Relaxed', desc: '±250 kcal/day' },
                  { id: Pace.NORMAL, label: 'Standard', desc: '±500 kcal/day' },
                  { id: Pace.AGGRESSIVE, label: 'Aggressive', desc: '±750 kcal/day' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setData({ ...data, pace: p.id })}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${data.pace === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className="font-bold text-slate-800">{p.label}</div>
                    <div className="text-xs text-slate-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="p-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <button 
              onClick={step === 3 ? handleSubmit : nextStep}
              className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              {step === 3 ? (
                <>Finish <Check size={20} /></>
              ) : (
                <>Next <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
