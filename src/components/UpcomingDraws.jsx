import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, ChevronRight, Percent, Clock } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { getPublicLiveBanners } from '../services/liveBannerService';
import { getPublicStaticBanners } from '../services/staticBannerService';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      let newTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTime = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      setTimeLeft(newTime);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-2 justify-center text-center">
      <div className="bg-black/5 border border-black/5 rounded-xl px-3 py-2 w-14">
        <span className="block font-display font-bold text-lg text-[#0A2114] leading-none">{timeLeft.days}</span>
        <span className="text-[9px] uppercase tracking-wider text-[#3E4A42]/60 font-semibold mt-0.5 block">Days</span>
      </div>
      <div className="bg-black/5 border border-black/5 rounded-xl px-3 py-2 w-14">
        <span className="block font-display font-bold text-lg text-[#0A2114] leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-[#3E4A42]/60 font-semibold mt-0.5 block">Hrs</span>
      </div>
      <div className="bg-black/5 border border-black/5 rounded-xl px-3 py-2 w-14">
        <span className="block font-display font-bold text-lg text-[#0A2114] leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-[#3E4A42]/60 font-semibold mt-0.5 block">Min</span>
      </div>
      <div className="bg-black/5 border border-black/5 rounded-xl px-3 py-2 w-14">
        <span className="block font-display font-bold text-lg text-[#87641B] leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] uppercase tracking-wider text-[#3E4A42]/60 font-semibold mt-0.5 block">Sec</span>
      </div>
    </div>
  );
};

const UpcomingDraws = () => {
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [bannerSettings, setBannerSettings] = useState(null);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [staticBanners, setStaticBanners] = useState([]);

  useEffect(() => {
    getPublicStaticBanners()
      .then(setStaticBanners)
      .catch(error => console.error('API Error fetching public static banners:', error));
  }, []);

  const draws = [
    {
      id: 'pineapple-gift-2026',
      title: 'Mega Pineapple Gift Coupon',
      prize: '₹1.5 Crore',
      bonusPrize: 'Toyota Fortuner + 50g Gold',
      ticketPrice: '250',
      drawDate: 'August 24, 2026 15:30:00',
      odds: '1 in 4,500',
      soldPercentage: 78,
      featured: true,
      live: false,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&fit=crop&q=80',
      accentColor: 'gold'
    },
    {
      id: 'grand-auto-2026',
      title: 'Grand Auto & SUV Festival',
      prize: 'Mahindra Thar 4x4',
      bonusPrize: '₹30 Lakh 1st Runner Up',
      ticketPrice: '500',
      drawDate: 'August 19, 2026 12:00:00',
      odds: '1 in 8,000',
      soldPercentage: 92,
      featured: false,
      live: true,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&fit=crop&q=80',
      accentColor: 'emerald'
    },
    {
      id: 'malo-coupon-2026',
      title: 'Galo-Malo Monsoon Coupon',
      prize: '₹3.0 Crore',
      bonusPrize: '10x Royal Enfield Classic',
      ticketPrice: '1,000',
      drawDate: 'August 30, 2026 18:00:00',
      odds: '1 in 15,000',
      soldPercentage: 45,
      featured: true,
      live: false,
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&fit=crop&q=80',
      accentColor: 'gold'
    },
    {
      id: 'breeze-min-2026',
      title: 'Weekly Breeze Micro Draw',
      prize: '₹25 Lakh',
      bonusPrize: 'Instant Cashback Rewards',
      ticketPrice: '100',
      drawDate: 'August 16, 2026 14:00:00',
      odds: '1 in 1,200',
      soldPercentage: 95,
      featured: false,
      live: false,
      image: 'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=600&fit=crop&q=80',
      accentColor: 'emerald'
    }
  ];

  const handleViewBanners = async (draw) => {
    setSelectedDraw(draw);
    setBannerSettings(null);
    setIsLoadingBanners(true);
    try {
      const settings = draw.live
        ? await getPublicLiveBanners(draw.id)
        : { banners: (await getPublicStaticBanners()).map(banner => banner.image), youtube_live_url: '', facebook_live_url: '' };
      setBannerSettings(settings);
    } catch (error) {
      setBannerSettings({ error: error.message || 'Unable to load banners.' });
    } finally {
      setIsLoadingBanners(false);
    }
  };

  return (
    <section id="draws" className="relative py-24 bg-bg-secondary/20 border-t border-b border-black/5">
      <div className="absolute top-[30%] left-[5%] w-72 h-72 rounded-full bg-emerald/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="text-left space-y-3">
            <span className="text-xs font-bold text-[#87641B] uppercase tracking-widest font-display">
              Upcoming Pools
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2114] tracking-tight font-display">
              Select Your Lucky Ticket
            </h2>
            <p className="text-[#3E4A42] max-w-lg text-sm font-light">
              Explore our verified premium lotteries. Purchase tickets instantly with government-approved security.
            </p>
          </div>

          <div className="flex gap-2">
            <span className="px-4 py-2 text-xs font-semibold rounded-full bg-black/5 border border-black/5 text-[#3E4A42]">
              Total Draws Active: 4
            </span>
          </div>
        </div>

        {/* Draws Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {draws.map((draw, drawIndex) => (
            <GlassCard
              key={draw.id}
              glowColor={draw.accentColor}
              className="flex flex-col justify-between text-left h-full border border-black/5 relative p-0 overflow-hidden group"
            >
              {/* Prize Banner Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={!draw.live && staticBanners.length > 0 ? staticBanners[drawIndex % staticBanners.length].image : draw.image}
                  alt={draw.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent pointer-events-none" />

                {/* Badges on Top of Image */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {draw.live && <Badge variant="live">LIVE</Badge>}
                  {draw.featured && <Badge variant="featured">FEATURED</Badge>}
                  {!draw.live && !draw.featured && <Badge variant="standard">ACTIVE</Badge>}
                </div>

                <div className="absolute top-4 right-4 z-10 text-right bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl border border-gold/20 shadow-sm">
                  <span className="text-[9px] text-[#3E4A42]/60 block font-semibold uppercase tracking-wider leading-none">Ticket Price</span>
                  <span className="font-display font-extrabold text-base text-[#87641B]">₹{draw.ticketPrice}</span>
                </div>
              </div>

              {/* Title & Prizes content box */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#0A2114] group-hover:text-gold transition-colors duration-300">
                      {draw.title}
                    </h3>
                    <p className="text-[10px] text-[#3E4A42]/60 mt-1 flex items-center gap-1">
                      <span>★ Bonus:</span> {draw.bonusPrize}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#3E4A42]/60 font-semibold uppercase tracking-wider block">Grand 1st Prize</span>
                    <p className="text-2xl font-black text-[#0A2114] font-display leading-tight">{draw.prize}</p>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="mb-6 bg-black/3 p-4 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-1.5 text-xs text-[#3E4A42]/60 mb-3 justify-center">
                    <Clock className="w-3.5 h-3.5 text-[#87641B]" />
                    <span className="font-medium">Draw starts in:</span>
                  </div>
                  <CountdownTimer targetDate={draw.drawDate} />
                </div>

                {/* Progress gauge & Odds */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#3E4A42]/60 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-gold" /> Winning Probability:
                    </span>
                    <span className="text-[#0A2114]">{draw.odds}</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[#3E4A42]/60 font-semibold">Tickets Booked</span>
                      <span className="text-[#87641B] font-bold">{draw.soldPercentage}%</span>
                    </div>
                    <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden border border-black/5">
                      <motion.div
                        className="bg-gradient-to-r from-gold to-[#A88438] h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${draw.soldPercentage}%` }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#3E4A42]/60">
                    <Calendar className="w-4 h-4" />
                    <span>Draw: {new Date(draw.drawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewBanners(draw)}
                      className="px-3 py-2.5 text-[10px] font-bold rounded-xl border border-black/10 text-[#3E4A42] hover:border-gold hover:text-[#87641B] transition-colors"
                    >
                      View Banners
                    </button>
                    <Button
                      variant={draw.accentColor}
                      className="px-6 py-2.5 text-xs rounded-2xl"
                      onClick={() => alert(`Ticket booking initialized for: ${draw.title}`)}
                    >
                      Book Now <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {selectedDraw && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedDraw(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button type="button" onClick={() => setSelectedDraw(null)} aria-label="Close banners" className="absolute right-4 top-4 p-2 rounded-lg hover:bg-black/5 text-[#3E4A42]">×</button>
            <h3 className="font-display font-bold text-xl text-[#0A2114] pr-10">{selectedDraw.title} Banners</h3>
            {isLoadingBanners ? (
              <p className="text-sm text-[#3E4A42]/70 py-10 text-center">Loading banners...</p>
            ) : bannerSettings?.error ? (
              <p className="text-sm text-red-600 py-10 text-center">{bannerSettings.error}</p>
            ) : (
              <div className="mt-5 space-y-5">
                {bannerSettings?.banners?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bannerSettings.banners.map((banner, index) => (
                      <img key={`${banner}-${index}`} src={banner} alt={`${selectedDraw.title} banner ${index + 1}`} className="w-full h-40 object-cover rounded-xl border border-black/10" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#3E4A42]/70 py-6 text-center">No banners available for this draw.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-black/5 pt-4 text-xs">
                  <a href={bannerSettings?.youtube_live_url || '#'} target="_blank" rel="noreferrer" className="text-red-600 font-semibold truncate">YouTube Live</a>
                  <a href={bannerSettings?.facebook_live_url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold truncate">Facebook Live</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default UpcomingDraws;
