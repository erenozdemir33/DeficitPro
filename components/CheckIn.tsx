
import React, { useState } from 'react';
import { UserProfile, CheckIn as CheckInType } from '../types';
import { addCheckIn, updateProfile } from '../services/storage';
import { Scale, Heart, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CheckInProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ profile, onProfileUpdate }) => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(profile.weightKg);
  const [adherence, setAdherence] = useState(5);
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = () => {
    let adjustment = 0;
    const weightDiff = weight - profile.weightKg;
    
    if (adherence >= 8) {
      if (profile.goal === 'LOSE' && weightDiff >= -0.2) {
        adjustment = -100;
      } else if (profile.goal === 'GAIN' && weightDiff <= 0.2) {
        adjustment = 100;
      }
    }

    const newCheckIn: CheckInType = {
      date: new Date().toISOString().split('T')[0],
      weight,
      adherence,
      adjustment
    };

    const updatedProfile: UserProfile = {
      ...profile,
      weightKg: weight,
      targetKcal: profile.targetKcal + adjustment
    };

    addCheckIn(newCheckIn);
    updateProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="p-8 text-center space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/40 rounded-[40px] flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">All Set!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
            Plan calibrated. We've updated your daily targets based on this week's data. 
          </p>
        </div>
        <button 
          onClick={() => window.location.hash = '#/'}
          className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.05] transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 max-w-lg mx-auto">
      <div className="text-center pt-10 space-y-2">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Calibration</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Adjusting your path</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800">
        {step === 1 ? (
          <div className="space-y-10">
            <div className="flex flex-col items-center gap-5">
              <div className="p-6 bg-sky-50 dark:bg-sky-900/30 text-sky-500 rounded-[32px]">
                <Scale size={36} />
              </div>
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">Current Weight</h3>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-6xl font-black text-slate-800 dark:text-white mb-8 tracking-tighter">
                {weight} <span className="text-2xl text-slate-300 dark:text-slate-700">kg</span>
              </div>
              <input 
                type="range" 
                min={profile.weightKg - 5} 
                max={profile.weightKg + 5} 
                step="0.1" 
                className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
              <div className="w-full flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>-{5}kg</span>
                <span>+{5}kg</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[28px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl"
            >
              Continue <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-10">
             <div className="flex flex-col items-center gap-5">
              <div className="p-6 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-[32px]">
                <Heart size={36} />
              </div>
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">Adherence</h3>
            </div>

            <div className="space-y-8">
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Score: {adherence}/10</p>
              <div className="flex justify-between gap-1.5">
                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                  <button
                    key={v}
                    onClick={() => setAdherence(v)}
                    className={`flex-1 h-12 rounded-xl text-[10px] font-black transition-all ${adherence >= v ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-bold text-slate-500 italic">
                {adherence < 4 ? "Tough week, we'll make it easier." : adherence < 8 ? "Good effort, keep it up!" : "Elite consistency detected!"}
              </p>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/20"
            >
              Calibrate Plan <Sparkles size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 dark:bg-indigo-950/40 rounded-[32px] text-white border border-white/10">
        <h4 className="text-xs font-black flex items-center gap-2 mb-2 uppercase tracking-widest text-indigo-400">
          <Sparkles size={16} />
          Coach Note
        </h4>
        <p className="text-xs text-slate-400 dark:text-indigo-200 font-medium leading-relaxed">
          Daily fluctuations are normal. Focus on your 7-day trend. Today's calibration adjusts your metabolic targets for the week ahead.
        </p>
      </div>
    </div>
  );
};
