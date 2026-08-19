import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Heart, MessageCircle, Send, Play, Tv, Volume2 } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import Button from './ui/Button';

const LiveDraw = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: 'Aman S.', text: 'Got my ticket! Good luck everyone!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=60' },
    { id: 2, user: 'Rohit K.', text: 'Is Galo-Malo draw today?', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=60' },
    { id: 3, user: 'Priya D.', text: 'Fortuner is mine today! 🤞', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=60' }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!isPlaying) return;
    const usernames = ['Vikram J.', 'Siddharth M.', 'Riya Sharma', 'Anil Mehta', 'Sunita P.', 'Rahul Goel'];
    const textComments = [
      'Omg ₹1.5 Cr draw starting!',
      'Check ticket button ready!',
      'I bought 5 tickets this time!',
      'Government approval is the key.',
      'Last week my neighbor won ₹10 Lakhs!',
      'Fingers crossed!!'
    ];

    const interval = setInterval(() => {
      const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
      const randomText = textComments[Math.floor(Math.random() * textComments.length)];
      const newMsg = {
        id: Date.now(),
        user: randomUser,
        text: randomText,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=80&fit=crop&q=60`
      };

      setComments(prev => [...prev.slice(-4), newMsg]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const msg = {
      id: Date.now(),
      user: 'You',
      text: newComment,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=60'
    };
    setComments(prev => [...prev.slice(-4), msg]);
    setNewComment('');
  };

  return (
    <section id="live-draw" className="relative py-24 bg-bg-primary">
      <div className="absolute top-[10%] right-[10%] w-72 h-72 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-72 h-72 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <Badge variant="live" className="animate-pulse">LIVE DRAW ROOM</Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A2114] tracking-tight font-display">
            Watch the Live Draw
          </h2>
          <p className="text-[#3E4A42] font-light text-sm">
            Experience absolute transparency. Watch our state-of-the-art physical draw machine pick the winning coupons live on camera.
          </p>
        </div>

        {/* Live Draw Monitor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Stream Player Container */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-[28px] overflow-hidden border border-black/10 shadow-2xl bg-black/5 flex items-center justify-center group">
              
              {/* Stream Video Placeholder */}
              {!isPlaying ? (
                <div className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center p-6 text-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&fit=crop&q=80')" }}>
                  {/* Black overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
                  
                  <div className="relative z-10 space-y-6 max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gold/20 border border-gold/40 hover:border-gold/70 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(197,160,89,0.35)] hover:scale-110 transition-all duration-300 cursor-pointer" onClick={() => setIsPlaying(true)}>
                      <Play className="w-8 h-8 text-[#0A2114] fill-current ml-1" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-xl text-white">Next Official Draw Broadcast</h4>
                      <p className="text-sm text-white/70">Scheduled for Today • 15:30 PM (IST). Toggle play to test streaming servers.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#E6EFEA] via-[#F4FAF6] to-[#F2EFE8] z-0">
                  <div className="relative flex flex-col items-center justify-center text-center">
                    
                    {/* Simulated Draw Machine Drum */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="w-48 h-48 rounded-full border-4 border-dashed border-gold/60 flex items-center justify-center relative shadow-[0_0_50px_rgba(197,160,89,0.1)]"
                    >
                      <div className="w-36 h-36 rounded-full border-2 border-emerald/20 flex items-center justify-center">
                        <span className="font-display font-black text-3xl text-[#87641B] tracking-widest animate-pulse">AUREUM</span>
                      </div>
                      
                      {/* Floating balls */}
                      <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-emerald text-white font-bold flex items-center justify-center text-xs shadow-lg">14</div>
                      <div className="absolute bottom-6 right-4 w-8 h-8 rounded-full bg-gold text-[#0A2114] font-bold flex items-center justify-center text-xs shadow-lg">07</div>
                      <div className="absolute bottom-8 left-8 w-8 h-8 rounded-full bg-white text-[#0A2114] border border-black/5 font-bold flex items-center justify-center text-xs shadow-lg">92</div>
                    </motion.div>
                    
                    <div className="mt-8 space-y-1">
                      <p className="text-xs font-semibold text-emerald uppercase tracking-widest flex items-center gap-1.5 justify-center">
                        <span className="h-2 w-2 rounded-full bg-[#0F8253] animate-ping" /> Server Connected
                      </p>
                      <h4 className="text-lg font-bold text-[#0A2114]">Drawing balls in progress...</h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Stream Top Panel Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <div className="flex gap-2">
                  <Badge variant="live">LIVE</Badge>
                  <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1">
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" /> 1,482 Watching
                  </span>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                  <button className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all cursor-pointer">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all cursor-pointer">
                    <Tv className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stream Bottom Controls Overlay */}
              {isPlaying && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="text-left bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-black/5 max-w-[280px]">
                    <span className="text-[9px] uppercase tracking-wider text-[#87641B] font-bold">LATEST BALLS IN</span>
                    <div className="flex gap-2 mt-1.5">
                      <span className="w-8 h-8 rounded-full bg-gold text-[#0A2114] font-bold text-sm flex items-center justify-center">07</span>
                      <span className="w-8 h-8 rounded-full bg-emerald text-white font-bold text-sm flex items-center justify-center">14</span>
                      <span className="w-8 h-8 rounded-full bg-white text-[#0A2114] border border-black/5 font-bold text-sm flex items-center justify-center">92</span>
                      <span className="w-8 h-8 rounded-full border border-black/10 bg-black/5 font-semibold text-sm flex items-center justify-center text-[#3E4A42]/30">?</span>
                      <span className="w-8 h-8 rounded-full border border-black/10 bg-black/5 font-semibold text-sm flex items-center justify-center text-[#3E4A42]/30">?</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsPlaying(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stream Chat Area */}
          <div className="lg:col-span-4 flex">
            <GlassCard hoverEffect={false} className="w-full flex flex-col justify-between border border-black/5 bg-white/30 p-5 h-[340px] lg:h-auto">
              <div className="border-b border-black/5 pb-3 mb-4 flex items-center justify-between">
                <span className="font-display font-semibold text-sm tracking-wide text-[#0A2114]">Live Draw Chat</span>
                <span className="text-[10px] text-emerald font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Online
                </span>
              </div>

              <div className="flex-1 space-y-3.5 overflow-y-auto mb-4 pr-1 text-left scrollbar-thin">
                <AnimatePresence>
                  {comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5"
                    >
                      <img 
                        src={comment.avatar} 
                        alt={comment.user}
                        className="w-7 h-7 rounded-full object-cover border border-black/5" 
                      />
                      <div className="bg-white/60 rounded-2xl rounded-tl-none p-2.5 border border-black/5 max-w-[85%]">
                        <span className="block text-[10px] font-bold text-[#87641B] mb-0.5">{comment.user}</span>
                        <p className="text-xs text-[#3E4A42] leading-snug">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder={isPlaying ? "Say something..." : "Start stream to chat..."}
                  disabled={!isPlaying}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-black/5 border border-black/15 rounded-xl px-3.5 py-2 text-xs text-[#0A2114] placeholder-[#3E4A42]/30 focus:outline-none focus:border-gold/45 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isPlaying}
                  className="p-2.5 rounded-xl bg-gold text-[#0A2114] hover:bg-gold/80 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDraw;
