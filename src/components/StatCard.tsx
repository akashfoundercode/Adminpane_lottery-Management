import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
  color?: 'emerald' | 'warning' | 'danger' | 'info' | 'gray';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, color = 'gray' }) => {
  let iconBg = 'bg-gray-50 text-gray-500 border border-gray-100';
  
  if (color === 'emerald') {
    iconBg = 'bg-emerald-50 text-brand-emerald border border-emerald-100';
  } else if (color === 'warning') {
    iconBg = 'bg-amber-50 text-warning-main border border-amber-100';
  } else if (color === 'danger') {
    iconBg = 'bg-red-50 text-danger-main border border-red-100';
  } else if (color === 'info') {
    iconBg = 'bg-blue-50 text-info-main border border-blue-100';
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="premium-card p-5 relative overflow-hidden bg-white border border-border-light shadow-sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</p>
          <h3 className="text-2xl font-bold font-display mt-2 text-text-primary">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.type === 'up' ? 'bg-green-50 text-success-main' : trend.type === 'down' ? 'bg-red-50 text-danger-main' : 'bg-gray-50 text-text-secondary'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-xs text-text-secondary">{description}</span>}
        </div>
      )}
    </motion.div>
  );
};
export default StatCard;
