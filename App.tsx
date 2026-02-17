
import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, Theme } from './types';
import { loadState, updateProfile } from './services/storage';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Insights } from './components/Insights';
import { FitnessPlanner } from './components/FitnessPlanner';
import { CheckIn } from './components/CheckIn';
import { LayoutDashboard, TrendingUp, Dumbbell, UserCheck, Settings, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'fitness' | 'checkin'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/insights') setActiveTab('insights');
      else if (hash === '#/fitness') setActiveTab('fitness');
      else if (hash === '#/checkin') setActiveTab('checkin');
      else setActiveTab('dashboard');
      setShowSettings(false);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync theme with document class
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

  const toggleTheme = () => {
    if (!state.profile) return;
    const newTheme: Theme = state.profile.theme === 'dark' ? 'light' : 'dark';
    handleProfileUpdate({ ...state.profile, theme: newTheme });
  };

  if (!state.profile?.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const theme = state.profile.theme || 'light';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header with Settings Toggle */}
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400">DeficitPro</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
           <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">User Settings</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Target</div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-200">{state.profile.targetKcal} kcal</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Current Weight</div>
                <div className="text-lg font-black text-slate-700 dark:text-slate-200">{state.profile.weightKg} kg</div>
              </div>
           </div>
           <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="w-full mt-6 py-3 text-red-500 text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 rounded-xl"
           >
            Reset All Data
           </button>
        </div>
      )}

      <main className="pb-28">
        {activeTab === 'dashboard' && <Dashboard profile={state.profile} />}
        {activeTab === 'insights' && <Insights state={state} />}
        {activeTab === 'fitness' && (
          <FitnessPlanner 
            plan={state.workoutPlan} 
            onUpdate={(plan) => setState(prev => ({ ...prev, workoutPlan: plan }))} 
          />
        )}
        {activeTab === 'checkin' && (
          <CheckIn 
            profile={state.profile} 
            onProfileUpdate={handleProfileUpdate} 
          />
        )}
      </main>

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 flex justify-around items-center h-20 px-4 pb-2 z-50">
        <button 
          onClick={() => window.location.hash = '#/'}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
            <LayoutDashboard size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Track</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#/insights'}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'insights' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'insights' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
            <TrendingUp size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Trends</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#/fitness'}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'fitness' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'fitness' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
            <Dumbbell size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Plan</span>
        </button>
        <button 
          onClick={() => window.location.hash = '#/checkin'}
          className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'checkin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'checkin' ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''}`}>
            <UserCheck size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">CheckIn</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
