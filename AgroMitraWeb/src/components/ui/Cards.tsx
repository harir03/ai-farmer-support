import React from 'react';
import { componentClasses } from '@/lib/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  primary: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    valueBg: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:border-green-300 hover:shadow-green-100/50'
  },
  secondary: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    valueBg: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:border-blue-300 hover:shadow-blue-100/50'
  },
  accent: {
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    valueBg: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:border-purple-300 hover:shadow-purple-100/50'
  },
  success: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    valueBg: 'text-emerald-600',
    border: 'border-emerald-200',
    hover: 'hover:border-emerald-300 hover:shadow-emerald-100/50'
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    valueBg: 'text-amber-600',
    border: 'border-amber-200',
    hover: 'hover:border-amber-300 hover:shadow-amber-100/50'
  },
  error: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    valueBg: 'text-red-600',
    border: 'border-red-200',
    hover: 'hover:border-red-300 hover:shadow-red-100/50'
  },
  info: {
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-600',
    valueBg: 'text-sky-600',
    border: 'border-sky-200',
    hover: 'hover:border-sky-300 hover:shadow-sky-100/50'
  },
  gray: {
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    valueBg: 'text-gray-600',
    border: 'border-gray-200',
    hover: 'hover:border-gray-300 hover:shadow-gray-100/50'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  onClick,
  trend
}) => {
  const classes = colorClasses[color];
  
  return (
    <div 
      className={`
        ${componentClasses.card.base} p-6 
        ${classes.border} ${classes.hover}
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        transition-all duration-300
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1">
          <div className={`p-3 ${classes.iconBg} rounded-xl shadow-sm`}>
            <div className={`w-6 h-6 ${classes.iconText}`}>
              {icon}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className={`text-3xl font-bold ${classes.valueBg} tracking-tight`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            <svg 
              className={`w-4 h-4 mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  className = '',
  headerAction
}) => {
  return (
    <div className={`${componentClasses.card.hover} p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={componentClasses.text.h5}>{title}</h3>
        {headerAction}
      </div>
      <div className={componentClasses.text.body}>
        {children}
      </div>
    </div>
  );
};

interface InstructionCardProps {
  title: string;
  instructions: Array<{ step: number; text: string }>;
  className?: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({
  title,
  instructions,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 hover:border-green-300 rounded-xl p-6 transition-all duration-300 ${className}`}>
      <div className="flex items-start">
        <div className="p-3 bg-green-100 rounded-xl shadow-sm mr-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-4">{title}</h3>
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center mr-4 shadow-sm">
                  {instruction.step}
                </span>
                <p className="text-sm text-green-800 leading-relaxed pt-1">{instruction.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};