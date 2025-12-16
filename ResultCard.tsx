import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
  subValue?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  colorClass = "text-slate-900",
  subValue
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg bg-slate-100 ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('700', '100')}`}>
            <Icon className={`w-5 h-5 ${colorClass}`} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        </div>
        <div className={`text-3xl font-bold ${colorClass} tracking-tight`}>
          {value}
        </div>
        {subValue && (
          <div className="mt-2 text-sm text-slate-400 font-medium">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};