import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger';
  trend?: number[];
  subStats?: { label: string; value: string | number }[];
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'primary',
  trend,
  subStats,
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-red-600',
  };

  const changeClasses = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 min-h-[220px] flex flex-col items-center justify-between"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center mb-2`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-4 tracking-wide uppercase">{title}</h3>
      <div className="w-full flex-1 flex flex-col justify-center gap-2">
        {subStats && subStats.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {subStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between w-full px-1">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</span>
                <span className="text-base font-bold text-primary-600 dark:text-primary-400">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {change && (
        <p className={`text-xs font-medium ${changeClasses[changeType]} mt-3 text-center`}>{change}</p>
      )}
    </motion.div>
  );
};

export default StatsCard;