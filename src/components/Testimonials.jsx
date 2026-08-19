import React from 'react';
import { Star, Quote, Award } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const Testimonials = () => {
  const reviews = [
    {
      name: 'Rohan Sharma',
      city: 'Delhi',
      win: 'Won ₹25 Lakhs in Breeze Mini',
      text: 'Honestly, I was skeptical about lucky draws at first. But watch the broadcast live on YouTube, it was verified by government auditors, and my winning ticket serial PN-1029 was drawn. I got the payment directly in my account within a day! Highly recommend.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80'
    },
    {
      name: 'Kavita Reddy',
      city: 'Hyderabad',
      win: 'Won Enfield Classic 350',
      text: 'Superb support! Booking a coupon is so smooth. The UI feels like Stripe or Airbnb—extremely clean and secure. Checked my results instantly, and got a verification call from the team. Thank you Aureum team!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80'
    },
    {
      name: 'Michael Sangma',
      city: 'Shillong',
      win: 'Won ₹1.5 Cr Pineapple Draw',
      text: 'Absolutely life-changing event! The process is highly transparent. State representatives and banking officers handled the payout smoothly without any hassle. Aureum has changed the standard of lottery draws in India.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80'
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 bg-bg-secondary/20 border-t border-black/5">
      <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-72 h-72 rounded-full bg-emerald/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-[#87641B] uppercase tracking-widest font-display">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A2114] tracking-tight font-display">
            Stories from our Winners
          </h2>
          <p className="text-[#3E4A42] font-light text-sm">
            Read real feedback from our validated lottery ticket winners who have experienced security and financial transparency first-hand.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <GlassCard 
              key={idx}
              glowColor="gold"
              className="flex flex-col justify-between text-left h-full border border-black/5 p-6 relative group bg-white/70"
            >
              <div className="space-y-6">
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-black/5" />
                </div>

                {/* Review Text */}
                <p className="text-xs text-[#3E4A42]/85 leading-relaxed font-light italic">
                  "{rev.text}"
                </p>
              </div>

              {/* User Bio */}
              <div className="mt-8 pt-5 border-t border-black/5 flex items-center gap-3.5">
                <img 
                  src={rev.avatar} 
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-black/5" 
                />
                
                <div className="text-left">
                  <h4 className="font-display font-semibold text-sm text-[#0A2114]">{rev.name}</h4>
                  <span className="text-[10px] text-[#3E4A42]/60 font-light block">{rev.city}</span>
                  
                  {/* Win Badge */}
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#0F8253] font-semibold mt-1">
                    <Award className="w-3 h-3" /> {rev.win}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
