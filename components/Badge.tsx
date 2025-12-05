
import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'premium';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', icon }) => {
  const baseStyles = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold capitalize tracking-wide border";
  
  const variants = {
    primary: "bg-emerald-50 text-emerald-700 border-emerald-200",
    secondary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    premium: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm shadow-amber-100", // Gold/Premium style
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {icon && <span className="text-[10px]">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
