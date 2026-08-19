import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Ticket, ArrowUpRight, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import Button from './ui/Button';

const AnimatedCounter = ({ value, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.replace(/,/g, ''), 10);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        clearInterval(timer);
        start = end;
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return <span>{prefix}{formatNumber(count)}{suffix}</span>;
};

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh]">
      {/* Decorative Blur Orbs for Light Theme */}
      <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gold/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60vw] h-[30vh] rounded-full bg-gold/5 blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Text Content */}
        <div className="lg:col-span-7 text-left space-y-8">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/5 shadow-sm"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#87641B]" />
            <span className="text-xs font-semibold text-[#3E4A42] font-display uppercase tracking-widest">
              Premium Government Approved Draw
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-5xl md:text-6xl xl:text-7xl text-[#0A2114] tracking-tight leading-[1.05]"
          >
            Unveil Your <br />
            <span className="gold-text-gradient">Golden Destiny</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#3E4A42] text-lg md:text-xl max-w-xl font-light leading-relaxed animate-fade"
          >
            Participate in India's most secure, transparent, and high-payout lucky draws. Styled with absolute luxury, verified under state licenses.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <Button variant="gold" onClick={() => window.location.href = '#draws'}>
              <Ticket className="w-4 h-4" /> Book Ticket
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '#results'}>
              Check Ticket
            </Button>
            <a
              href="#live-draw"
              className="inline-flex items-center gap-2 text-[#3E4A42] hover:text-[#0A2114] transition-colors duration-300 font-semibold text-sm group ml-2"
            >
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-red-500/10 border border-black/10 group-hover:border-red-500/30 transition-all duration-300">
                <Play className="w-3.5 h-3.5 text-[#3E4A42] group-hover:text-red-600 fill-current" />
              </span>
              Watch Live Draw
            </a>
          </motion.div>

          {/* Safety note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-2 text-[#3E4A42]/60 text-xs font-semibold"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-[#0F8253]" />
            <span>100% Audit Transparent • Certified Draw Code • Encrypted Transactions</span>
          </motion.div>
        </div>

        {/* Floating Visual Area with Images */}
        <div className="lg:col-span-5 relative flex justify-center items-center h-[380px] md:h-[480px]">
          {/* Main Visual Center: Glass panel showing golden background wealth theme */}
          <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center animate-[pulse_4s_infinite]">
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-emerald/5 border border-emerald/20 flex items-center justify-center animate-[pulse_3s_infinite]" />
          </div>

          {/* Gold Coin / Ticket Image Card 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: 50, rotate: -15 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: -10 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 md:left-8 top-12 z-20 animate-float"
          >
            <div className="glass-panel rounded-2xl border-gold/30 w-48 shadow-2xl overflow-hidden relative">
              <div className="h-28 w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&fit=crop&q=80')" }} />
              <div className="p-4 text-left">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#87641B]">MEGA GOLD</span>
                  <span className="text-[8px] bg-gold/20 text-[#87641B] px-1.5 py-0.5 rounded font-bold">1st Prize</span>
                </div>
                <p className="text-2xl font-black text-[#0A2114] font-display leading-none">₹2.5 Cr</p>
                <div className="w-full border-t border-dashed border-black/5 my-2.5" />
                <div className="flex justify-between items-center text-[8px] text-[#3E4A42]/60">
                  <span>Draw: 28th Aug</span>
                  <span className="font-bold text-[#0F8253]">Active</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Luxury SUV Image Card 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: -50, rotate: 15 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 12 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-4 md:right-8 bottom-12 z-10 animate-float-reverse"
          >
            <div className="glass-panel rounded-2xl border-emerald/30 w-48 shadow-2xl overflow-hidden relative">
              <div className="h-28 w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&fit=crop&q=80')" }} />
              <div className="p-4 text-left">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F8253]">CAR LUXE</span>
                  <span className="text-[8px] bg-emerald/20 text-[#0F8253] px-1.5 py-0.5 rounded font-bold">SUV Edition</span>
                </div>
                <p className="text-xl font-bold text-[#0A2114] font-display leading-none">Thar 4x4</p>
                <div className="w-full border-t border-dashed border-black/5 my-2.5" />
                <div className="flex justify-between items-center text-[8px] text-[#3E4A42]/60">
                  <span>Draw: 19th Aug</span>
                  <span className="font-bold text-[#87641B]">Hot</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Counter Area */}
      <div className="max-w-7xl mx-auto px-6 mt-16 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-[32px] glass-panel border-gold/10 shadow-2xl relative overflow-hidden"
        >
          {/* Stat 1 */}
          <div className="text-left space-y-1">
            <span className="text-xs font-semibold text-[#3E4A42]/60 uppercase tracking-widest font-display">
              Total Grand Pools
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#87641B] font-display">
              <AnimatedCounter value="250,000,000" prefix="₹" />
            </p>
            <span className="text-[10px] text-[#3E4A42]/60 block">Guaranteed distribution</span>
          </div>

          {/* Stat 2 */}
          <div className="text-left space-y-1 border-l border-black/10 pl-6">
            <span className="text-xs font-semibold text-[#3E4A42]/60 uppercase tracking-widest font-display">
              Tickets Issued
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#0A2114] font-display">
              <AnimatedCounter value="84,291" suffix="+" />
            </p>
            <span className="text-[10px] text-[#0F8253] font-semibold block">Live verified transactions</span>
          </div>

          {/* Stat 3 */}
          <div className="text-left space-y-1 border-l border-black/10 pl-6">
            <span className="text-xs font-semibold text-[#3E4A42]/60 uppercase tracking-widest font-display">
              Winning Chances
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#0F8253] font-display">
              1 in 2,500
            </p>
            <span className="text-[10px] text-[#3E4A42]/60 block">Highest in government lotteries</span>
          </div>

          {/* Stat 4 */}
          <div className="text-left space-y-1 border-l border-black/10 pl-6">
            <span className="text-xs font-semibold text-[#3E4A42]/60 uppercase tracking-widest font-display">
              Today's Next Draw
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#0A2114] font-display">
              06h 42m 15s
            </p>
            <span className="text-[10px] text-[#87641B] font-bold block flex items-center gap-1">
              <span className="text-red-500 animate-ping">●</span> Live draws hourly
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
