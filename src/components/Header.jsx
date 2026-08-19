import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import Button from './ui/Button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Upcoming Draws', href: '#draws' },
    { name: 'Results', href: '#results' },
    { name: 'How It Play', href: '#how-it-works' },
    { name: 'Trust', href: '#trust' },
    { name: 'About', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-bg-primary/90 backdrop-blur-md border-b border-black/5 py-4' 
            : 'bg-transparent py-6'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center shadow-[0_4px_12px_rgba(197,160,89,0.1)] group-hover:border-gold group-hover:shadow-[0_4px_18px_rgba(197,160,89,0.25)] transition-all duration-300">
              <Ticket className="w-5 h-5 text-[#87641B]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight leading-none text-[#0A2114]">
                AUREUM<span className="text-gold">.</span>
              </span>
              <span className="text-[9px] font-sans font-semibold tracking-[0.25em] text-emerald uppercase mt-0.5 leading-none">
                LUCKY DRAW
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-black/5 rounded-full p-1 border border-black/5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-[#3E4A42] hover:text-[#0A2114] rounded-full transition-colors duration-300 group"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gold rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Toggle */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-black/5 text-[#3E4A42] hover:text-[#0A2114] transition-all duration-300 focus:outline-none cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-72 p-2 bg-bg-primary/95 border border-gold/20 rounded-2xl shadow-2xl backdrop-blur-lg"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      placeholder="Search ticket code or draw name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/5 border border-black/15 rounded-xl px-3.5 py-2 text-sm text-[#0A2114] placeholder-[#3E4A42]/40 focus:outline-none focus:border-gold/50"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#draws" className="text-sm font-semibold text-[#3E4A42] hover:text-[#0A2114] transition-colors duration-300">
              Check Ticket
            </a>
            
            <Button variant="gold" onClick={() => window.location.href = '#draws'}>
              Book Ticket <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-black/5 text-[#3E4A42] hover:text-[#0A2114]"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-[#3E4A42] hover:text-[#0A2114]"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-bg-primary/99 backdrop-blur-xl lg:hidden flex flex-col justify-between p-8 border-l border-black/5"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-12">
                <a href="#home" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center">
                    <Ticket className="w-4.5 h-4.5 text-[#87641B]" />
                  </div>
                  <span className="font-display font-extrabold text-lg tracking-tight text-[#0A2114]">
                    AUREUM<span className="text-gold">.</span>
                  </span>
                </a>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 text-[#3E4A42]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display font-bold text-2xl text-[#3E4A42] hover:text-[#0A2114] transition-colors duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="flex flex-col gap-4">
              {searchOpen && (
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search draw name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-[#0A2114] placeholder-[#3E4A42]/30"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-[#3E4A42]/60 mb-2 px-1">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald" /> Government Approved</span>
                <span>v1.0.0</span>
              </div>
              <Button variant="gold" className="w-full" onClick={() => { setMobileMenuOpen(false); window.location.href = '#draws'; }}>
                Book Ticket Now <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating header search bar */}
      <AnimatePresence>
        {searchOpen && searchQuery && (
          <motion.div
            className="fixed inset-x-0 top-24 z-40 max-w-xl mx-auto p-4 bg-bg-primary/95 border border-black/10 rounded-2xl shadow-2xl backdrop-blur-md text-left"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-xs text-[#3E4A42]/50 mb-2 uppercase tracking-wider font-semibold">Results for "{searchQuery}"</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <a href="#draws" onClick={() => setSearchOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 transition-all text-[#3E4A42]">
                <span className="font-medium text-sm">Mega Pineapple Gift Coupon</span>
                <span className="text-xs text-gold">1 in 5,000 odds</span>
              </a>
              <a href="#draws" onClick={() => setSearchOpen(false)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 transition-all text-[#3E4A42]">
                <span className="font-medium text-sm">Grand Auto Gift Coupon</span>
                <span className="text-xs text-gold">1 in 10,000 odds</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
