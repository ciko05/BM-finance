import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
  description?: string;
  prefix?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  description,
  prefix 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="relative mt-1">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={value === 0 ? '' : value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : val);
          }}
          className={`block w-full rounded-lg border-slate-300 bg-slate-50 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg font-medium py-3 px-4 ${prefix ? 'pl-12' : ''} transition-colors`}
          placeholder="0"
        />
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
};