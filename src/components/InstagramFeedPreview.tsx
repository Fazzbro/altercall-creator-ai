import React, { useState } from "react";
import { InstagramPlan } from "../types";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  plan: InstagramPlan;
  activeHookType: "curiosity" | "visual" | "relatable";
  onSelectHookType: (type: "curiosity" | "visual" | "relatable") => void;
}

export default function InstagramFeedPreview({ plan, activeHookType, onSelectHookType }: Props) {
  const isCarousel = plan.strategy.bestFormat.toLowerCase() === "carousel";
  
  // State for carousel slide index
  const [slideIndex, setSlideIndex] = useState(0);

  const getHookText = () => {
    switch (activeHookType) {
      case "curiosity":
        return plan.hooks.curiosityHook;
      case "visual":
        return plan.hooks.visualActionHook;
      case "relatable":
        return plan.hooks.relatableHook;
      default:
        return plan.hooks.curiosityHook;
    }
  };

  // Slides structure if Carousel format is active
  const slides = [
    {
      title: "Slide 1: Grab Attention (Hook)",
      content: getHookText(),
      type: "Hook",
      color: "from-purple-900/40 to-indigo-900/40"
    },
    {
      title: "Slide 2: Deliver Core Trust (Value)",
      content: plan.contentArc.threeToFifteenSeconds,
      type: "Story & Value",
      color: "from-indigo-900/40 to-blue-900/40"
    },
    {
      title: "Slide 3: Climax & Frictionless Action",
      content: `${plan.contentArc.fifteenPlusSeconds}\n\n👉 CTA: ${plan.contentArc.cta}`,
      type: "Payoff & CTA",
      color: "from-slate-900 to-indigo-955/35"
    }
  ];

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="flex flex-col items-center sticky top-24">
      <div className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
          <div className="w-2 h-2 rounded-full bg-[#ff4f00] animate-pulse shadow-[0_0_8px_rgba(255,79,0,0.8)]" />
          Live Preview
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <span className="text-zinc-400">Target:</span>
          <span>{plan.strategy.bestFormat}</span>
        </div>
      </div>

      {/* Hook Selectors for Realtime Simulated Feed Updates */}
      <div className="w-full mb-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Test 3-Second Hooks
          </label>
          <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-xl">
            <button
              onClick={() => onSelectHookType("curiosity")}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeHookType === "curiosity"
                  ? "bg-gradient-to-r from-[#ff4f00] to-[#ff7300] text-white shadow-[0_0_15px_rgba(255,79,0,0.3)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Curiosity
            </button>
            <button
              onClick={() => onSelectHookType("visual")}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeHookType === "visual"
                  ? "bg-gradient-to-r from-[#ff4f00] to-[#ff7300] text-white shadow-[0_0_15px_rgba(255,79,0,0.3)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => onSelectHookType("relatable")}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeHookType === "relatable"
                  ? "bg-gradient-to-r from-[#ff4f00] to-[#ff7300] text-white shadow-[0_0_15px_rgba(255,79,0,0.3)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Relatable
            </button>
          </div>
        </div>
      </div>

      {/* Phone Shell Face Mockup */}
      <div className="relative w-full max-w-[300px] aspect-[9/16] bg-[#050505] border-[6px] border-[#111] rounded-[40px] overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        
        {/* Phone Notch/Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0a0a0a] rounded-full z-20 flex items-center justify-center border border-white/5">
        </div>

        {/* --- REEL (9:16 vertical full frame) --- */}
        {!isCarousel ? (
          <div className="absolute inset-0 w-full h-full flex flex-col justify-end p-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-[#050505] to-[#050505]">
            
            {/* Ambient dynamic backdrop pattern to mimic real video */}
            <div className="absolute inset-0 bg-transparent -z-10" />
            
            {/* On-video Floating Hook Text Card - The primary pattern interrupt */}
            <div className="absolute top-20 left-4 right-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 z-10 transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 text-[10px] text-[#ff4f00] font-mono font-bold mb-3 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Text Overlay</span>
              </div>
              <p className="text-sm font-display leading-snug text-zinc-100">
                {getHookText()}
              </p>
              {activeHookType === "visual" && (
                <div className="mt-4 text-[10px] text-zinc-400 font-mono bg-black/40 px-2 py-1.5 rounded-lg border border-white/5 inline-block">
                  🎬 Perform this physical interrupt
                </div>
              )}
            </div>

            {/* Bottom Info details overlay */}
            <div className="w-full flex-col space-y-3 z-10 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff4f00] to-[#ff7300] p-[2px]">
                  <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-sm border-b border-transparent hover:border-white transition-colors cursor-pointer font-medium text-white">
                    @creator
                  </div>
                </div>
              </div>

              {/* Simulated Reels description */}
              <p className="text-[12px] text-zinc-300 leading-relaxed line-clamp-2 drop-shadow-md">
                {plan.seoCaption.firstLine}
              </p>

              {/* Dynamic Sound Track mockup */}
              <div className="flex items-center gap-1.5 max-w-full group cursor-pointer">
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">🎵 Audio Track • Original</span>
              </div>
            </div>

            {/* Simulated Action Drawer Sidebar on the right */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-6 z-10">
              <div className="flex flex-col items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer">
                <Heart className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white font-mono drop-shadow-md">8.4K</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer">
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="text-[10px] text-white font-mono drop-shadow-md">384</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer group">
                <Send className="w-6 h-6 text-white group-hover:text-[#ff4f00] transition-colors" />
                <span className="text-[10px] text-white font-mono drop-shadow-md">12.5K</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 hover:scale-110 transition-transform cursor-pointer">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <MoreHorizontal className="w-6 h-6 text-white cursor-pointer hover:opacity-70" />
            </div>

          </div>
        ) : (
          /* --- CAROUSEL (3:4 aspect swiper layout) --- */
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between bg-[#050505] text-white p-4 pt-8">
            {/* Header profile */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff4f00] to-[#ff7300] p-[2px]">
                  <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <span className="text-sm font-medium">@creator</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{slideIndex + 1}/3</span>
            </div>

            {/* Slide Body */}
            <div className={`my-auto p-6 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex flex-col justify-center min-h-[220px] shadow-2xl relative overflow-hidden`}>
              <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#ff4f00]/30 rounded-full blur-2xl" />
              
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff4f00] mb-3 relative z-10">
                {slides[slideIndex].type}
              </div>
              
              <div className="space-y-2 relative z-10">
                <p className="text-sm md:text-base font-display leading-relaxed text-white">
                  {slides[slideIndex].content}
                </p>
              </div>

              {/* Slider controls inside slide */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5 relative z-10">
                <button 
                  onClick={handlePrevSlide}
                  className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Dots indicator */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        slideIndex === i ? "bg-white" : "bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={handleNextSlide}
                  className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Actions Drawer */}
            <div className="flex justify-between items-center border-t border-white/10 pt-3 pb-2 text-white">
              <div className="flex items-center gap-5">
                <Heart className="w-5 h-5 hover:text-[#ff4f00] cursor-pointer transition-colors" />
                <MessageCircle className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
                <Send className="w-5 h-5 cursor-pointer hover:text-[#ff4f00] transition-colors" />
              </div>
              <Bookmark className="w-5 h-5 cursor-pointer hover:text-[#ff4f00] transition-colors" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
