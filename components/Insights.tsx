
import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Award, Zap, Activity, Target, Droplets, Compass } from 'lucide-react';

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

    const recentDates = dates.slice(-limit);
    return recentDates.map(d => {
      const log = state.logs[d];
      const intake = log.meals.reduce((s, m) => s + m.kcal, 0);
      const target = state.profile?.targetKcal || 2000;
      const water = log.water.reduce((s, w) => s + w.amount, 0);
      const diff = intake - target;
      return {
        date: timeframe === '7d' ? new Date(d).toLocaleDateString('en-US', { weekday: 'short' }) : d.slice(5),
        fullDate: d,
        intake,
        target,
        diff,
        water,
        steps: log.steps || 0
      };
    });
  }, [state.logs, state.profile, timeframe]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const count = chartData.length;
    const avgIntake = chartData.reduce((s, d) => s + d.intake, 0) / count;
    const avgSteps = chartData.reduce((s, d) => s + d.steps, 0) / count;
    const complianceDays = chartData.filter(d => d.intake <= d.target + 100).length;
    const adherence = (complianceDays / count) * 100;
    
    return { avgIntake, avgSteps, adherence, totalDays: count };
  }, [chartData]);

  const writtenInsights = useMemo(() => {
    if (!stats || !state.profile) return [];
    const insights = [];
    
    // Dietitian Tone
    if (stats.avgIntake > state.profile.targetKcal + 100) {
      insights.push({
        title: 'Calorie Adjustment',
        text: `You're averaging ${Math.round(stats.avgIntake - state.profile.targetKcal)} kcal above target. Focus on Turkish proteins (köfte, mercimek) to stay full longer.`,
        type: 'diet',
        color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20'
      });
    } else {
      insights.push({
        title: 'Excellent Discipline',
        text: 'Your intake consistency is elite. Maintaining this trend will lead to sustainable results.',
        type: 'diet',
        color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20'
      });
    }

    if (stats.avgSteps < state.profile.targetSteps * 0.8) {
      insights.push({
        title: 'Activity Boost',
        text: `To hit target tomorrow, add a 20-min brisk walk. You're ~${Math.round(state.profile.targetSteps - stats.avgSteps)} steps shy daily.`,
        type: 'fit',
        color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20'
      });
    }

    return insights;
  }, [stats, state.profile]);

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 mt-28 flex flex-col items-center gap-6">
        <Compass size={64} className="opacity-10 animate-pulse" />
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">Analysis Pending</h3>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Log data to unlock insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-32 max-w-lg mx-auto">
      <div className="bg-white dark:bg-slate-900 p-2 rounded-[32px] shadow-sm border dark:border-slate-800 mt-6">
        <div className="flex gap-2">
          {(['7d', '1m', '1y'] as const).map(t => (
            <button key={t} onClick={() => setTimeframe(t)} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${timeframe === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 dark:text-slate-600 hover:text-indigo-400'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-indigo-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Intake</span>
          </div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">{Math.round(stats?.avgIntake || 0)} <span className="text-xs font-bold text-slate-400">kcal</span></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-7 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consistency</span>
          </div>
          <div className="text-3xl font-black text-emerald-500">{Math.round(stats?.adherence || 0)}%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Calories Trends</h3>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-black text-slate-400 uppercase">Intake</span></div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} hide={timeframe === '1y'} />
              <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDark ? '#0f172a' : '#fff', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.2)' }} itemStyle={{ fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }} />
              <Area type="monotone" dataKey="intake" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorIntake)" />
              <Line type="monotone" dataKey="target" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth={2} strokeDasharray="8 8" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Daily Balance</h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-slate-400 uppercase">Deficit</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[9px] font-black text-slate-400 uppercase">Surplus</span></div>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} hide={timeframe !== '7d'} />
              <Tooltip cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDark ? '#0f172a' : '#fff' }} />
              <Bar dataKey="diff" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-3">Weekly Coaching</h3>
        {writtenInsights.map((insight, idx) => (
          <div key={idx} className={`${insight.bg} p-8 rounded-[40px] border border-white dark:border-slate-800 shadow-sm flex gap-6 items-center transition-all hover:scale-[1.02]`}>
            <div className={`p-4 rounded-[22px] bg-white dark:bg-slate-900 shadow-sm ${insight.color}`}>
              {insight.type === 'diet' ? <Zap size={24} /> : <Award size={24} />}
            </div>
            <div>
              <h4 className={`font-black text-sm uppercase tracking-wider ${insight.color}`}>{insight.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed mt-1.5 opacity-80">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
