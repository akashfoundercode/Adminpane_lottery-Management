import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  hoverEffect = true,
  glowColor = 'gold', // 'gold', 'emerald', 'none'
  ...props
}) => {
  const glowStyles = {
    gold: 'hover:border-gold/50 hover:shadow-gold/10 hover:shadow-[0_15px_35px_rgba(197,160,89,0.18)]',
    emerald: 'hover:border-emerald/50 hover:shadow-emerald/10 hover:shadow-[0_15px_35px_rgba(15,130,83,0.15)]',
    none: ''
  };

  return (
    <motion.div
      className={`glass-panel rounded-3xl p-6 transition-all duration-500 overflow-hidden relative ${
        hoverEffect ? `glass-panel-hover ${glowStyles[glowColor]}` : ''
      } ${className}`}
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Decorative gradient orb inside card */}
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gold/5 blur-2xl pointer-events-none group-hover:bg-gold/10 transition-all duration-500" />
      
      {children}
    </motion.div>
  );
};

export default GlassCard;
