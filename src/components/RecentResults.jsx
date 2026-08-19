import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Ticket, ChevronRight, X, ArrowUpRight, CheckCircle, AlertTriangle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import Button from './ui/Button';

const RecentResults = () => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchCode, setSearchCode] = useState('');
  const [ticketStatus, setTicketStatus] = useState(null);

  const results = [
    {
      id: 'pineapple-lot1',
      title: 'Pineapple Coupon Lot 2',
      prize: '₹1.0 Crore',
      winnerCode: 'PN-8104-92',
      winnerName: 'Aashish Kumar',
      winnerCity: 'Guwahati, Assam',
      date: 'Aug 10, 2026',
      badge: 'BUMPER',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&fit=crop&q=80',
      gradient: 'from-amber-600/5 via-yellow-600/3 to-amber-700/5'
    },
    {
      id: 'grand-auto-lot3',
      title: 'Monsoon SUV Special',
      prize: 'Fortuner 4x4',
      winnerCode: 'TH-9201-14',
      winnerName: 'Gurpreet Singh',
      winnerCity: 'Ludhiana, Punjab',
      date: 'Aug 07, 2026',
      badge: 'AUTO',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&fit=crop&q=80',
      gradient: 'from-blue-600/5 via-indigo-600/3 to-indigo-700/5'
    },
    {
      id: 'breeze-lot99',
      title: 'Breeze Mini Lot 54',
      prize: '₹25 Lakh',
      winnerCode: 'BR-0492-81',
      winnerName: 'Nandini Das',
      winnerCity: 'Kolkata, West Bengal',
      date: 'Aug 05, 2026',
      badge: 'MINI',
      image: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=400&fit=crop&q=80',
      gradient: 'from-emerald-600/5 via-teal-600/3 to-teal-700/5'
    }
  ];

  const handleVerifyTicket = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    const normalized = searchCode.trim().toUpperCase();
    if (normalized === 'PN-8104-92' || normalized === 'TH-9201-14' || normalized === 'BR-0492-81') {
      setTicketStatus('win');
    } else {
      setTicketStatus('lose');
    }
  };

  return (
    <section id="results" className="relative py-24 bg-bg-primary/50">
      <div className="absolute top-[20%] right-[5%] w-72 h-72 rounded-full bg-emerald/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header & Verification Input */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7 text-left space-y-3">
            <span className="text-xs font-bold text-emerald uppercase tracking-widest font-display">
              Recent Draws
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2114] tracking-tight font-display">
              Winners & Draw Results
            </h2>
            <p className="text-[#3E4A42] max-w-lg text-sm font-light">
              Review latest official draw listings. You can also verify your ticket barcode or coupon serial number directly.
            </p>
          </div>

          {/* Ticket Verifier Form */}
          <div className="lg:col-span-5 w-full">
            <form onSubmit={handleVerifyTicket} className="glass-panel border-gold/30 p-6 rounded-3xl relative overflow-hidden text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#87641B] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" /> Verify Ticket Serial
                </span>
                <span className="text-[10px] text-[#3E4A42]/60">Secure TLS 1.3 Audit</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PN-8104-92"
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value);
                    setTicketStatus(null);
                  }}
                  className="flex-grow bg-black/5 border border-black/15 rounded-2xl px-4 py-3 text-sm text-[#0A2114] placeholder-[#3E4A42]/30 focus:outline-none focus:border-gold/40 uppercase"
                />
                <Button variant="gold" type="submit" className="px-5 py-3 text-xs rounded-2xl">
                  Verify
                </Button>
              </div>

              <AnimatePresence>
                {ticketStatus === 'win' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-emerald/10 border border-emerald/30 rounded-2xl flex items-center gap-3 text-[#0F8253] text-xs font-semibold"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p>Congratulations! This ticket has WON a prize.</p>
                      <button 
                        type="button" 
                        onClick={() => alert('Claim ticket process initialized')}
                        className="underline text-[10px] font-bold mt-0.5 hover:text-[#0A2114] transition-colors"
                      >
                        Initiate claim process →
                      </button>
                    </div>
                  </motion.div>
                )}

                {ticketStatus === 'lose' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-semibold"
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>No winning records found for this coupon serial. Please check and retry.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Results Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {results.map((result) => (
            <GlassCard
              key={result.id}
              glowColor="emerald"
              className="flex flex-col justify-between text-left h-full border border-black/5 relative p-0 overflow-hidden group"
            >
              {/* Prize Banner Image */}
              <div className="h-32 w-full overflow-hidden">
                <img 
                  src={result.image} 
                  alt={result.title} 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 to-transparent pointer-events-none" />
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <div className="flex items-center justify-between">
                  <Badge variant="winner">WINNER PICK</Badge>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#3E4A42]/50">{result.badge}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-[#3E4A42]/60 block font-semibold uppercase tracking-wider">Draw Title</span>
                    <h3 className="font-display font-bold text-base text-[#0A2114] group-hover:text-gold transition-colors duration-300">
                      {result.title}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#3E4A42]/60 block font-semibold uppercase tracking-wider">Winning Value</span>
                    <p className="text-2xl font-black text-[#0A2114] font-display leading-none">{result.prize}</p>
                  </div>

                  <div className="bg-black/3 border border-black/5 p-3 rounded-2xl">
                    <span className="text-[9px] text-[#87641B] uppercase tracking-wider font-bold block mb-1">Coupon Serial Code</span>
                    <span className="font-display font-black text-lg text-[#0A2114] tracking-widest">{result.winnerCode}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-black/5 flex items-center justify-between mt-auto">
                <div className="text-left mt-4">
                  <span className="text-[9px] text-[#3E4A42]/50 block font-semibold uppercase">Winner Name</span>
                  <span className="text-xs font-bold text-[#0A2114]">{result.winnerName}</span>
                  <span className="text-[10px] text-[#3E4A42]/70 block font-light">{result.winnerCity}</span>
                </div>

                <button
                  onClick={() => setSelectedResult(result)}
                  className="w-9 h-9 rounded-xl bg-black/5 border border-black/10 hover:border-gold hover:bg-gold/10 flex items-center justify-center text-[#3E4A42] hover:text-gold transition-all duration-300 cursor-pointer mt-4"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Details Dialog */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-panel border-gold/30 max-w-md w-full p-8 rounded-[32px] text-left relative overflow-hidden shadow-2xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <button
                onClick={() => setSelectedResult(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 text-[#3E4A42]/60 hover:text-[#0A2114] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center shadow-lg shadow-gold/10">
                  <Trophy className="w-6 h-6 text-[#87641B]" />
                </div>
                <div>
                  <Badge variant="winner">OFFICIAL VERIFIED</Badge>
                  <h4 className="font-display font-bold text-xl text-[#0A2114] mt-1">Draw Audit File</h4>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-black/5 pb-3">
                  <span className="text-[10px] uppercase text-[#3E4A42]/60 block font-semibold">Draw Event</span>
                  <span className="text-sm font-semibold text-[#0A2114]">{selectedResult.title}</span>
                </div>
                <div className="border-b border-black/5 pb-3">
                  <span className="text-[10px] uppercase text-[#3E4A42]/60 block font-semibold">Prizepool Claimed</span>
                  <span className="text-base font-bold text-[#87641B]">{selectedResult.prize}</span>
                </div>
                <div className="border-b border-black/5 pb-3">
                  <span className="text-[10px] uppercase text-[#3E4A42]/60 block font-semibold">Winning Coupon Code</span>
                  <span className="text-sm font-mono font-bold text-[#0A2114] tracking-widest bg-black/5 px-2.5 py-1 rounded-md border border-black/5 inline-block mt-0.5">{selectedResult.winnerCode}</span>
                </div>
                <div className="border-b border-black/5 pb-3">
                  <span className="text-[10px] uppercase text-[#3E4A42]/60 block font-semibold">Verified Lucky Winner</span>
                  <span className="text-sm font-semibold text-[#0A2114] block">{selectedResult.winnerName}</span>
                  <span className="text-xs text-[#3E4A42]/60 block font-light">{selectedResult.winnerCity}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#3E4A42]/60 block font-semibold">Audit Time</span>
                  <span className="text-xs text-[#3E4A42]/60 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Checked & signed on {selectedResult.date}
                  </span>
                </div>
              </div>

              <Button 
                variant="gold" 
                className="w-full mt-8 rounded-2xl py-3"
                onClick={() => setSelectedResult(null)}
              >
                Close Audit Record
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RecentResults;
