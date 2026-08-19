  import React from 'react';
import { Accordion } from './ui/Accordion';
import GlassCard from './ui/GlassCard';

const FAQ = () => {
  const faqItems = [
    {
      title: 'How do I know the draws are 100% fair and transparent?',
      content: 'Aureum Draw operates under state lottery acts. Each draw is held at an official public venue and live-streamed on our website, YouTube, and Facebook. The physical drum machine is inspected by a legal committee and auditing firms prior to every draw. Results are stamped and signed on legal ledger files.'
    },
    {
      title: 'How do I claim my prize money if I win?',
      content: 'For prizes below ₹10,000, funds are instantly credited to your Aureum Wallet which you can withdraw to any bank account via UPI or NetBanking. For larger amounts and grand prizes (like cars or jackpots above ₹10 Lakhs), our dedicated Claim Support team will guide you through verifying your ID, submitting physical coupons, and completing state tax compliance (TDS).'
    },
    {
      title: 'Are there any hidden fees or extra charges for buying tickets?',
      content: 'No. The ticket price shown (e.g., ₹250 or ₹500) is all-inclusive. Transaction fees for gateway processing are fully absorbed by Aureum Draw. Standard government tax compliance (TDS at 30% under Sec 194B) applies only to your actual winnings, which is deducted at source prior to payment.'
    },
    {
      title: 'What payment modes are supported on the platform?',
      content: 'We support all major payment networks in India, including BHIM UPI (PhonePe, Google Pay, Paytm, CRED), Debit and Credit Cards (Visa, Mastercard, RuPay), and secure NetBanking channels with bank-grade SHA-256 encryption security.'
    },
    {
      title: 'Can I select my own lucky coupon numbers?',
      content: 'Yes! When booking a ticket, you can either select your own numbers using our digit keyboard selector or choose the "Randomize / Lucky Pick" option to have the server generate a unique coupon serial for you.'
    }
  ];

  return (
    <section id="faq" className="relative py-24 bg-bg-primary">
      <div className="absolute top-[30%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-bold text-emerald uppercase tracking-widest font-display">
            FAQ Guide
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A2114] tracking-tight font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-[#3E4A42] font-light text-sm">
            Have questions about legality, security, or claiming? Explore answers compiled by our compliance board.
          </p>
        </div>

        {/* FAQ Accordion Panel */}
        <GlassCard hoverEffect={false} className="border border-black/5 bg-white/70 p-6 md:p-10 rounded-3xl">
          <Accordion items={faqItems} />
        </GlassCard>

      </div>
    </section>
  );
};

export default FAQ;
