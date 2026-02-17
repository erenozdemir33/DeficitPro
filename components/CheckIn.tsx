
import React, { useState } from 'react';
import { UserProfile, CheckIn as CheckInType } from '../types';
import { addCheckIn, updateProfile } from '../services/storage';
import { Scale, Heart, Sparkles, ChevronRight, CheckCircle2, Moon, Zap } from 'lucide-react';

interface CheckInProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ profile, onProfileUpdate }) => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState(profile.weightKg);
  const [adherence, setAdherence] = useState(5);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = () => {
    let adjustment = 0;
    const weightDiff = weight - profile.weightKg;
    
    // Adaptive Logic
    if (adherence >= 8) {
      if (profile.goal === 'LOSE' && weightDiff >= -0.1) adjustment = -100; // Plateau detected
      else if (profile.goal === 'GAIN' && weightDiff <= 0.1) adjustment = 100; // Need more surplus
    } else if (adherence <= 4) {
      if (profile.goal === 'LOSE') adjustment = 100; // Sustainable reset
      else if (profile.goal === 'GAIN') adjustment = -100; // Sustainable reset
    }

    const newCheckIn: CheckInType = {
      date: new Date().toISOString().split('T')[0],
      weight,
      adherence,
      stressLevel: stress,
      sleepQuality: sleep,
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
      <div className="p-8 text-center space-y-10 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-28 h-28 bg-indigo-600 text-white rounded-[44px] flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-bounce">
          <CheckCircle2 size={56} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Recalibrated</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-xs mx-auto text-sm">
            Your goals have been adjusted based on this week's data. Sustainable progress is the key.
          </p>
        </div>
        <button onClick={() => window.location.hash = '#/'} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-12 py-5 rounded-[28px] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">Return Dashboard</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-10 max-w-lg mx-auto transition-all">
      <div className="text-center pt-12 space-y-3">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Weekly Calibration</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Adaptive Coaching Session</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 transition-all">
        {step === 1 ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-[32px] shadow-sm"><Scale size={40} /></div>
              <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 tracking-tight">Today's Weight</h3>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-7xl font-black text-slate-800 dark:text-white mb-10 tracking-tighter">
                {weight.toFixed(1)} <span className="text-2xl text-slate-300 dark:text-slate-700 tracking-normal font-bold">kg</span>
              </div>
              <input type="range" min={35} max={200} step="0.1" className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-6 rounded-[32px] font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl uppercase tracking-[0.2em] text-xs">
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-12">
             <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-[32px] shadow-sm"><Heart size={40} /></div>
              <h3 className="text-2xl font-black text-slate-700 dark:text-slate-200 tracking-tight">Holistic Check</h3>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                  <span className="text-xs font-black text-rose-500">{adherence}/10</span>
                </div>
                <div className="flex justify-between gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(v => (
                    <button key={v} onClick={() => setAdherence(v)} className={`flex-1 h-12 rounded-xl text-[10px] font-black transition-all ${adherence >= v ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 px-1">
                     <Moon size={12} className="text-indigo-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sleep Quality</span>
                   </div>
                   <div className="flex gap-1">
                     {[1,2,3,4,5].map(v => (
                       <button key={v} onClick={() => setSleep(v)} className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all ${sleep >= v ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{v}</button>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 px-1">
                     <Zap size={12} className="text-amber-500" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stress Level</span>
                   </div>
                   <div className="flex gap-1">
                     {[1,2,3,4,5].map(v => (
                       <button key={v} onClick={() => setStress(v)} className={`flex-1 py-3 rounded-lg text-[10px] font-black transition-all ${stress >= v ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>{v}</button>
                     ))}
                   </div>
                 </div>
              </div>
            </div>

            <button onClick={handleFinish} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/30 uppercase tracking-[0.2em] text-xs">
              Finalize Calibration <Sparkles size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-900 rounded-[40px] text-white border border-white/10 shadow-2xl transition-all">
        <h4 className="text-[11px] font-black flex items-center gap-3 mb-3 uppercase tracking-[0.2em] text-indigo-400">
          <Sparkles size={18} />
          Surprise Feature
        </h4>
        <p className="text-[11px] text-slate-400 font-bold leading-relaxed opacity-80">
          The Weekly Check-In isn't just a log; it's our "Adaptive Coaching Engine". It analyzes your energy levels (adherence) and body data to prevent plateaus before they happen.
        </p>
      </div>
    </div>
  );
};
