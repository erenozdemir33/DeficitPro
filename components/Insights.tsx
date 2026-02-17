
import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, AreaChart, Area, PieChart, Pie } from 'recharts';
import { TrendingUp, Award, Zap, Activity, Target, Droplets, Compass, BarChart3, Info, Sparkles, TrendingDown } from 'lucide-react';

interface InsightsProps {
  state: AppState;
}

export const Insights: React.FC<InsightsProps> = ({ state }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '1m' | '1y'>('7d');
  const isDark = document.documentElement.classList.contains('dark');

  const chartData = useMemo(() => {
    const dates = Object.keys(state.logs).sort();
    let limit = 7;
    if (timeframe === '1m') limit = 30;
    if (timeframe === '1y') limit = 365;

    const fullData = [];
    const now = new Date();
    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = state.logs[dateStr];
      const intake = log?.meals.reduce((s, m) => s + m.kcal, 0) || 0;
      const target = state.profile?.targetKcal || 2000;
      const water = log?.water.reduce((s, w) => s + w.amount, 0) || 0;
      const steps = log?.steps || 0;
      const diff = intake > 0 ? intake - target : 0;
      
      fullData.push({
        date: timeframe === '7d' ? d.toLocaleDateString('en-US', { weekday: 'short' }) : dateStr.slice(5),
        fullDate: dateStr,
        intake,
        target,
        diff,
        water,
        steps,
        rollingAvg: 0
      });
    }

    // Rolling Average (7-day window)
    for (let i = 0; i < fullData.length; i++) {
      const window = fullData.slice(Math.max(0, i - 6), i + 1);
      const activeWindow = window.filter(w => w.intake > 0);
      fullData[i].rollingAvg = activeWindow.length > 0 
        ? Math.round(activeWindow.reduce((s, w) => s + w.intake, 0) / activeWindow.length) 
        : 0;
    }

    return fullData;
  }, [state.logs, state.profile, timeframe]);

  const stats = useMemo(() => {
    const activeDays = chartData.filter(d => d.intake > 0);
    if (activeDays.length === 0) return null;
    
    const count = activeDays.length;
    const avgIntake = activeDays.reduce((s, d) => s + d.intake, 0) / count;
    const avgSteps = activeDays.reduce((s, d) => s + d.steps, 0) / count;
    const complianceDays = activeDays.filter(d => d.intake <= d.target + 150).length;
    const consistencyScore = Math.round((complianceDays / count) * 100);
    
    const totalDeficit = activeDays.reduce((s, d) => s + (d.target - d.intake), 0);
    const estFatLoss = (totalDeficit / 7700).toFixed(2);
    
    return { avgIntake, avgSteps, consistencyScore, totalDays: count, estFatLoss };
  }, [chartData]);

  const macroProxyData = useMemo(() => {
    if (!state.profile) return [];
    return [
      { name: 'Protein', value: state.profile.macroTargets.protein * 4, fill: '#6366f1' },
      { name: 'Carbs', value: state.profile.macroTargets.carbs * 4, fill: '#10b981' },
      { name: 'Fats', value: state.profile.macroTargets.fat * 9, fill: '#f59e0b' },
    ];
  }, [state.profile]);

  const writtenInsights = useMemo(() => {
    if (!state.profile || !stats) return [{ title: 'Analyzing Data...', text: 'Log consistently for 3 days to unlock deep insights.', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900' }];
    
    const insights = [];
    if (stats.consistencyScore >= 80) {
      insights.push({ title: 'Elite Consistency', text: 'Your intake stability is exceptional. This level of adherence ensures predictable weight delta.', type: 'win', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' });
    } else if (stats.consistencyScore < 50) {
      insights.push({ title: 'Metabolic Headroom', text: 'Inconsistent logs make forecasting difficult. Aim for a 3-day tracking streak to recalibrate.', type: 'alert', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' });
    }

    if (stats.avgSteps < state.profile.targetSteps * 0.7) {
      insights.push({ title: 'Movement Gap', text: `You're missing ~${Math.round(state.profile.targetSteps - stats.avgSteps)} steps daily. This reduces your burn by ~${Math.round((state.profile.targetSteps - stats.avgSteps) * 0.05)}kcal.`, type: 'fit', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' });
    }

    insights.push({ title: 'Energy Projection', text: `Current trajectory indicates ~${stats.estFatLoss}kg of total fat loss over the last ${stats.totalDays} days.`, type: 'stat', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20' });

    return insights;
  }, [stats, state.profile]);

  return (
    <div className="p-6 space-y-10 pb-32 max-w-lg mx-auto animate-in fade-in duration-700">
      {/* Timeframe Switcher */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-[32px] shadow-sm border dark:border-slate-800 mt-6 flex gap-2">
        {(['7d', '1m', '1y'] as const).map(t => (
          <button key={t} onClick={() => setTimeframe(t)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${timeframe === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:text-indigo-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[44px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-indigo-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Intake</span>
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            {Math.round(stats?.avgIntake || 0)} <span className="text-xs font-bold text-slate-400">kcal</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[44px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consistency</span>
          </div>
          <div className="text-3xl font-black text-emerald-500">
            {stats?.consistencyScore || 0}%
          </div>
        </div>
      </div>

      {/* Energy Flow Area Chart */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Metabolic Energy Flux</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-black text-slate-400 uppercase">Intake</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /><span className="text-[9px] font-black text-slate-400 uppercase">Avg</span></div>
            </div>
          </div>
          <TrendingUp size={20} className="text-indigo-500" />
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} hide={timeframe === '1y'} />
              <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} />
              <Tooltip cursor={{ stroke: '#6366f1' }} contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDark ? '#0f172a' : '#fff' }} />
              <Area type="monotone" dataKey="intake" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIntake)" />
              <Line type="monotone" dataKey="rollingAvg" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="target" stroke="#f43f5e" strokeWidth={1} dot={false} opacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Macro Proxy */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Macro Distribution Proxy</h3>
          <div className="h-48 w-full flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 {/* Fix: Moved cornerRadius={10} from Cell to Pie component */}
                 <Pie data={macroProxyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} cornerRadius={10}>
                   {macroProxyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center">
                <Sparkles size={16} className="text-indigo-500 mb-1" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Balance</span>
             </div>
          </div>
          <div className="flex justify-center gap-5">
             {macroProxyData.map(m => (
               <div key={m.name} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.fill }} />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{m.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Hydration Trends */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[56px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hydration VS Goal</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="date" fontSize={8} tickLine={false} axisLine={false} hide={timeframe !== '7d'} />
                <YAxis fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Bar dataKey="water" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-3">
          <Zap size={18} className="text-indigo-600" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Coach Insights</h3>
        </div>
        <div className="space-y-4">
          {writtenInsights.map((insight, idx) => (
            <div key={idx} className={`${insight.bg} p-8 rounded-[44px] border border-white dark:border-slate-800 shadow-sm flex gap-6 items-center transition-all hover:scale-[1.02] cursor-default`}>
              <div className={`p-4 rounded-[24px] bg-white dark:bg-slate-900 shadow-sm ${insight.color}`}>
                <Compass size={24} />
              </div>
              <div className="flex-1">
                <h4 className={`font-black text-sm uppercase tracking-wider ${insight.color}`}>{insight.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed mt-1.5 opacity-80">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
