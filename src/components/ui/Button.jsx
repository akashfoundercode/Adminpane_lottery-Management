import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'gold',
  className = '',
  onClick,
  type = 'button',
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-display font-semibold tracking-wide rounded-full px-8 py-3.5 text-sm transition-all duration-300 focus:outline-none cursor-pointer overflow-hidden z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    gold: 'gold-bg-gradient text-[#0A2114] shadow-lg shadow-gold/20 border border-gold/30 hover:border-gold/60',
    emerald: 'emerald-bg-gradient text-white shadow-lg shadow-emerald/20 border border-emerald/30 hover:border-emerald/60',
    outline: 'border border-gold/40 text-[#A88438] bg-transparent hover:bg-gold/5 hover:border-gold/60',
    ghost: 'text-[#3E4A42] bg-transparent hover:bg-black/5 hover:text-[#0A2114]',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={isDisabled ? {} : {
        scale: 1.04,
        boxShadow: variant === 'gold'
          ? '0 8px 25px rgba(197, 160, 89, 0.35)'
          : variant === 'emerald'
            ? '0 8px 25px rgba(15, 130, 83, 0.3)'
            : '0 5px 15px rgba(0, 0, 0, 0.05)',
      }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      {...props}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
      <span className="relative flex items-center gap-2">
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
        {children}
      </span>
    </motion.button>
  );
};

export default Button;
