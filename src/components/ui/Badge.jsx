import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

const Badge = ({ variant = 'standard', children, className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide font-display border';

  const variants = {
    standard: 'bg-black/5 text-[#3E4A42] border-black/5',
    featured: 'bg-gold/10 text-[#87641B] border-gold/30 shadow-[0_4px_12px_rgba(197,160,89,0.1)]',
    winner: 'bg-emerald/10 text-[#0F8253] border-emerald/30 shadow-[0_4px_12px_rgba(15,130,83,0.1)]',
    live: 'bg-red-500/10 text-red-600 border-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.1)]',
  };

  const getIcon = () => {
    switch (variant) {
      case 'featured':
        return <Sparkles className="w-3.5 h-3.5 text-[#87641B]" />;
      case 'winner':
        return <Trophy className="w-3.5 h-3.5 text-[#0F8253]" />;
      case 'live':
        return (
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {getIcon()}
      {children}
    </span>
  );
};

export default Badge;
