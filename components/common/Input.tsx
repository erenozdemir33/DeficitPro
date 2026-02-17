
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, onChange, value, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Strip leading zeros for numeric inputs if not just "0"
    if (props.type === 'number' && val.length > 1) {
      val = val.replace(/^0+/, '');
      if (val === '') val = '0';
    }
    
    // Create a synthesized event or just call onChange with modified target
    if (onChange) {
      const event = {
        ...e,
        target: { ...e.target, value: val }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      <input
        {...props}
        value={value}
        onChange={handleChange}
        className={`px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 ${className} ${error ? 'border-red-500' : ''}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
