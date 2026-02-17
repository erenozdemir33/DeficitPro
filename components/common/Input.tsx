
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  minVal?: number;
  maxVal?: number;
}

export const Input: React.FC<InputProps> = ({ label, error, minVal, maxVal, className, onChange, value, onBlur, ...props }) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Remove non-numeric if type is number
    if (props.type === 'number') {
      val = val.replace(/[^0-9]/g, '');
      // Strip leading zeros
      if (val.length > 1) {
        val = val.replace(/^0+/, '');
      }
      if (val === '') val = '';
    }
    
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: val }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>}
      <input
        {...props}
        value={value}
        onChange={handleInput}
        onBlur={handleBlur}
        className={`px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 transition-all text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 ${error ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5'} ${className}`}
      />
      {error && <span className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
};
