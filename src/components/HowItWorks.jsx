import React from 'react';
import { Compass, ShoppingCart, Loader2, Award, ArrowRight } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Select a Draw',
      description: 'Choose from our government approved active draws. Look at the prize, timing, and winning odds.',
      icon: <Compass className="w-6 h-6 text-[#87641B]" />,
      glowColor: 'gold'
    },
    {
      number: '02',
      title: 'Secure Ticket Purchase',
      description: 'Enter your lucky digits or buy random coupons. Complete payment securely via UPI, Cards, or NetBanking.',
      icon: <ShoppingCart className="w-6 h-6 text-emerald" />,
      glowColor: 'emerald'
    },
    {
      number: '03',
      title: 'Watch Draw Broadcast',
      description: 'Watch the machine pick lucky winning spheres live. Get auto notifications via SMS & WhatsApp.',
      icon: <Loader2 className="w-6 h-6 text-[#0A2114] animate-spin" />,
      glowColor: 'none'
    },
    {
      number: '04',
      title: 'Claim Your Wealth',
      description: 'Winners receive instant wallet transfers. Large bumper sums are guided by state-appointed officers.',
      icon: <Award className="w-6 h-6 text-[#87641B]" />,
      glowColor: 'gold'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-bg-secondary/20">
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[70vw] h-[30vh] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold text-[#87641B] uppercase tracking-widest font-display">
            Quick Guide
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A2114] tracking-tight font-display">
            How Aureum Works
          </h2>
          <p className="text-[#3E4A42] font-light text-sm">
            Getting started takes under two minutes. Follow our streamlined, fully verified legal draw steps to start winning.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[28%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-gold/30 via-black/5 to-emerald/20 pointer-events-none z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10">
              <GlassCard 
                glowColor={step.glowColor} 
                className="flex flex-col text-left justify-between h-full border border-black/5 group pt-8 relative bg-white/70"
              >
                {/* Large numbering */}
                <span className="absolute top-4 right-6 font-display font-black text-4xl text-[#3E4A42]/5 group-hover:text-[#3E4A42]/10 transition-colors">
                  {step.number}
                </span>

                <div className="space-y-6">
                  {/* Icon Frame */}
                  <div className="w-12 h-12 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center shadow-sm group-hover:border-gold/30 transition-all duration-300">
                    {step.icon}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-[#0A2114] group-hover:text-gold transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#3E4A42]/70 leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-1.5 text-[10px] font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Read policy <ArrowRight className="w-3 h-3" />
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
