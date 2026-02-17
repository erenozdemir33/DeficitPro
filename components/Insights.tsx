
import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { TrendingUp, Award, Zap } from 'lucide-react';

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
      const diff = intake - target;
      return {
        date: d.slice(5),
        intake,
        target,
        diff,
        water: log.water.reduce((s, w) => s + w.amount, 0),
        steps: log.steps
      };
    });
  }, [state.logs, state.profile, timeframe]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const avgIntake = chartData.reduce((s, d) => s + d.intake, 0) / chartData.length;
    const avgSteps = chartData.reduce((s, d) => s + d.steps, 0) / chartData.length;
    const adherence = (chartData.filter(d => Math.abs(d.diff) < 200).length / chartData.length) * 100;
    
    return { avgIntake, avgSteps, adherence };
  }, [chartData]);

  const coachInsights = useMemo(() => {
    if (!stats || !state.profile) return [];
    const insights = [];
    
    if (stats.avgIntake > state.profile.targetKcal) {
      insights.push({
        type: 'diet',
        title: 'Calorie Adjustment Needed',
        text: `Averaging ${Math.round(stats.avgIntake - state.profile.targetKcal)} kcal over target. Swap snacks for water to reset!`,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/20'
      });
    } else {
      insights.push({
        type: 'diet',
        title: 'Perfect Maintenance',
        text: 'Your intake matches your goals perfectly. Great protein choices!',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20'
      });
    }

    if (stats.avgSteps < state.profile.targetSteps) {
      insights.push({
        type: 'fit',
        title: 'Step Goal Gap',
        text: `You're ~${Math.round(state.profile.targetSteps - stats.avgSteps)} steps shy daily. Try a short walk after dinner.`,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950/20'
      });
    }

    return insights;
  }, [stats, state.profile]);

  if (chartData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 mt-20">
        <TrendingUp size={48} className="mx-auto mb-6 opacity-20" />
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">No Data Yet</h3>
        <p className="text-sm mt-2 max-w-[200px] mx-auto opacity-60">Log your first day to unlock deep analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border dark:border-slate-800">
        {(['7d', '1m', '1y'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${timeframe === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Intake</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{Math.round(stats?.avgIntake || 0)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(stats?.adherence || 0)}%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Intake vs Target</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} />
              <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: isDark ? '#0f172a' : '#fff', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: '800' }}
              />
              <Line type="monotone" dataKey="intake" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} />
              <Line type="monotone" dataKey="target" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Surplus (kcal)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: isDark ? '#475569' : '#94a3b8'}} />
              <Tooltip cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} />
              <Bar dataKey="diff" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Coach Analysis</h3>
        {coachInsights.map((insight, idx) => (
          <div key={idx} className={`${insight.bg} p-6 rounded-[32px] border border-white dark:border-slate-800 shadow-sm flex gap-5 items-center`}>
            <div className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm ${insight.color}`}>
              {insight.type === 'diet' ? <Zap size={22} /> : <Award size={22} />}
            </div>
            <div>
              <h4 className={`font-black text-sm uppercase tracking-wider ${insight.color}`}>{insight.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
