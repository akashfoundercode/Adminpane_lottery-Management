import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import Button from './ui/Button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-[#EFEFEE]/40 border-t border-black/5 pt-20 pb-10 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Footer Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-black/5">
          
          {/* Logo Column */}
          <div className="md:col-span-4 text-left space-y-6">
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center">
                <Ticket className="w-4.5 h-4.5 text-[#87641B]" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-[#0A2114]">
                AUREUM<span className="text-gold">.</span>
              </span>
            </a>
            
            <p className="text-xs text-[#3E4A42]/70 leading-relaxed font-light">
              India's premier certified draw platform. Reimagining transparency, technology, and wealth distribution with premium user experiences.
            </p>
            
            <div className="flex items-center gap-2 text-xs text-[#3E4A42]/70 font-semibold bg-black/5 border border-black/5 px-3.5 py-2.5 rounded-2xl w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald" /> Government License #AGL-2026/09
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="font-display font-bold text-sm text-[#0A2114] uppercase tracking-wider">Draws</h4>
            <ul className="space-y-2.5 text-xs text-[#3E4A42]/75 font-light">
              <li><a href="#draws" className="hover:text-gold transition-colors">Upcoming Pools</a></li>
              <li><a href="#results" className="hover:text-gold transition-colors">Draw Results</a></li>
              <li><a href="#live-draw" className="hover:text-gold transition-colors">Live Broadcaster</a></li>
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">Claim Ticket Page</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 text-left space-y-4">
            <h4 className="font-display font-bold text-sm text-[#0A2114] uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-xs text-[#3E4A42]/75 font-light">
              <li><a href="#trust" className="hover:text-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#trust" className="hover:text-gold transition-colors">Draw Terms</a></li>
              <li><a href="#trust" className="hover:text-gold transition-colors">Responsible Gaming</a></li>
              <li><a href="#trust" className="hover:text-gold transition-colors">State Licenses</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 text-left space-y-4">
            <h4 className="font-display font-bold text-sm text-[#0A2114] uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-[#3E4A42]/70 font-light leading-relaxed">
              Get notified of bumper pool launches, draw results, and instant cashback alerts.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-black/5 border border-black/10 rounded-2xl px-4 py-3 text-xs text-[#0A2114] placeholder-[#3E4A42]/45 focus:outline-none focus:border-gold/40"
              />
              <button
                type="submit"
                className="p-3 bg-gold text-[#0A2114] hover:bg-gold/80 rounded-2xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            {subscribed && (
              <span className="text-[10px] text-[#0F8253] font-bold block animate-pulse">● Subscribed successfully! check inbox.</span>
            )}
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#3E4A42]/60">
          <p>© 2026 Aureum Lucky Draw Ltd. All rights reserved.</p>
          
          <div className="flex gap-6">
            <a href="#trust" className="hover:text-[#0A2114] transition-colors">Terms of Play</a>
            <a href="#trust" className="hover:text-[#0A2114] transition-colors">Privacy Center</a>
            <a href="#faq" className="hover:text-[#0A2114] transition-colors">Support Desk</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
