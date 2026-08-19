import React from 'react';
import { Award, FileText, Lock, ShieldCheck, CheckCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const TrustSection = () => {
  const securityFeatures = [
    {
      title: 'State Approved & Licensed',
      description: 'Fully compliant with national lottery acts. Government oversight ensures that all draw results are certified and auditable.',
      icon: <Award className="w-5 h-5 text-[#87641B]" />,
    },
    {
      title: '100% Transparent Draws',
      description: 'Physical glass machines and certified random algorithm code. No hidden pre-selections, and public live broadcasts.',
      icon: <FileText className="w-5 h-5 text-emerald" />,
    },
    {
      title: 'Bank-Grade Payment Security',
      description: 'PCI-DSS Compliant gateway. Your details are safe with advanced SHA-256 encryption & multi-factor verification.',
      icon: <Lock className="w-5 h-5 text-[#87641B]" />,
    },
    {
      title: 'Fraud Alert Protection',
      description: 'We do not ask for cash advances. Large prize payouts are managed through official state banking structures.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald" />,
    }
  ];

  return (
    <section id="trust" className="relative py-24 bg-bg-primary">
      <div className="absolute top-[20%] left-[-5%] w-72 h-72 rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-80 h-80 rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text & Badges Column */}
          <div className="lg:col-span-5 text-left space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald uppercase tracking-widest font-display">
                Certified Safety
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A2114] tracking-tight font-display leading-tight">
                Secure & Trusted Lottery Play
              </h2>
            </div>
            
            <p className="text-[#3E4A42] font-light text-sm leading-relaxed">
              We take integrity extremely seriously. Every draw is conducted under strict monitoring by legal committees and auditing firms. No exceptions.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                <span className="text-sm font-semibold text-[#0A2114]">Official State License Number: #AGL-2026/09</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                <span className="text-sm font-semibold text-[#0A2114]">Signed Audited Results Uploaded Instantly</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                <span className="text-sm font-semibold text-[#0A2114]">Over ₹250+ Crores Distributed Safely</span>
              </div>
            </div>

            {/* Payment Partners */}
            <div className="pt-6 border-t border-black/5 space-y-3">
              <span className="text-[10px] text-[#3E4A42]/50 uppercase tracking-widest font-bold">Encrypted Gateways Supported</span>
              <div className="flex flex-wrap gap-4 items-center opacity-40">
                <span className="font-display font-black text-sm tracking-tight text-[#0A2114]">BHIM UPI</span>
                <span className="font-sans font-bold text-sm text-[#0A2114]">VISA</span>
                <span className="font-sans font-extrabold text-sm text-[#0A2114]">Mastercard</span>
                <span className="font-display font-medium text-xs text-[#0A2114]">NetBanking Secure</span>
              </div>
            </div>
          </div>

          {/* Cards Grid Column */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {securityFeatures.map((feat, idx) => (
              <GlassCard 
                key={idx}
                glowColor={idx % 2 === 0 ? 'gold' : 'emerald'}
                className="text-left border border-black/5 p-6 hover:shadow-xl transition-all duration-300 bg-white/70"
              >
                <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold text-base text-[#0A2114] mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#3E4A42]/70 leading-relaxed font-light">
                  {feat.description}
                </p>
              </GlassCard>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustSection;
