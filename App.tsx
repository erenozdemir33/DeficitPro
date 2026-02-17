
import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, Theme, LoggedFood } from './types';
import { loadState, updateProfile, getDayLog, updateDayLog } from './services/storage';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Insights } from './components/Insights';
import { FitnessPlanner } from './components/FitnessPlanner';
import { CheckIn } from './components/CheckIn';
import { MetabolicLab } from './components/MetabolicLab';
import { PlateScanner } from './components/PlateScanner';
import { LayoutDashboard, TrendingUp, Dumbbell, UserCheck, Settings, Moon, Sun, Camera } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'fitness' | 'checkin' | 'lab' | 'vision'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/insights') setActiveTab('insights');
      else if (hash === '#/fitness') setActiveTab('fitness');
      else if (hash === '#/checkin') setActiveTab('checkin');
      else if (hash === '#/lab') setActiveTab('lab');
      else if (hash === '#/vision') setActiveTab('vision');
      else setActiveTab('dashboard');
      setShowSettings(false);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const theme = state.profile?.theme || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.profile?.theme]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    updateProfile({ ...profile, theme: 'light' });
    setState(loadState());
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    updateProfile(profile);
    setState(loadState());
  };

  const handleAILog = (food: LoggedFood) => {
    const today = new Date().toISOString().split('T')[0];
    const log = getDayLog(today);
    const updatedLog = { ...log, meals: [...log.meals, food] };
    updateDayLog(today, updatedLog);
    setState(loadState());
    window.location.hash = '#/';
  };

  const toggleTheme = () => {
    if (state.profile) {
      const newTheme: Theme = state.profile.theme === 'dark' ? 'light' : 'dark';
      handleProfileUpdate({ ...state.profile, theme: newTheme });
    }
  };

  if (!state.profile?.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const theme = state.profile.theme || 'light';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-all">
        <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400">DeficitPro</h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-all">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Settings</h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${state.profile.bmiCategory === 'Normal weight' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                {state.profile.bmiCategory} (BMI: {state.profile.bmi})
              </span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Limit</div>
                <div className="text-xl font-black text-slate-800 dark:text-200">{state.profile.targetKcal} kcal</div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Baseline Steps</div>
                <div className="text-xl font-black text-slate-800 dark:text-200">{state.profile.baselineSteps}</div>
              </div>
           </div>
           <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full mt-8 py-5 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-950/20 rounded-[28px] hover:bg-rose-100 transition-all">
            Wipe All Data & Onboard Again
           </button>
        </div>
      )}

      <main className="pb-28">
        {activeTab === 'dashboard' && <Dashboard profile={state.profile} />}
        {activeTab === 'insights' && <Insights state={state} />}
        {activeTab === 'fitness' && (
          <FitnessPlanner plan={state.workoutPlan} onUpdate={(plan) => setState(prev => ({ ...prev, workoutPlan: plan }))} />
        )}
        {activeTab === 'vision' && (
          <PlateScanner onLog={handleAILog} onClose={() => window.location.hash = '#/'} />
        )}
        {activeTab === 'lab' && <MetabolicLab profile={state.profile} logs={state.logs} />}
        {activeTab === 'checkin' && (
          <CheckIn profile={state.profile} onProfileUpdate={handleProfileUpdate} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around items-center h-22 px-2 pb-6 pt-2 z-50">
        <button onClick={() => window.location.hash = '#/'} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-3 rounded-2xl ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}><LayoutDashboard size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Track</span>
        </button>
        <button onClick={() => window.location.hash = '#/insights'} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === 'insights' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-3 rounded-2xl ${activeTab === 'insights' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}><TrendingUp size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Trends</span>
        </button>
        <button onClick={() => window.location.hash = '#/vision'} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === 'vision' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-3 rounded-2xl ${activeTab === 'vision' ? 'bg-indigo-50 dark:bg-indigo-900/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-800/50'}`}><Camera size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Vision</span>
        </button>
        <button onClick={() => window.location.hash = '#/fitness'} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === 'fitness' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-3 rounded-2xl ${activeTab === 'fitness' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}><Dumbbell size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Plan</span>
        </button>
        <button onClick={() => window.location.hash = '#/checkin'} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${activeTab === 'checkin' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`p-3 rounded-2xl ${activeTab === 'checkin' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}><UserCheck size={20} /></div>
          <span className="text-[8px] font-black uppercase tracking-widest">CheckIn</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
