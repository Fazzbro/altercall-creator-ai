import React from "react";
import { Sparkles, Share2, Target, Hash, ShieldCheck, HelpCircle } from "lucide-react";

export default function AlgorithmTips() {
  const tips = [
    {
      icon: <Share2 className="w-5 h-5 text-indigo-400" />,
      title: "Shares & Saves > Likes",
      desc: "DM sharing and bookmarks/saves are the highest weighted signals. Our copy is optimized for raw educational value or high relatability to trigger instant shares.",
    },
    {
      icon: <Target className="w-5 h-5 text-rose-400" />,
      title: "The 3-Second Hook Rule",
      desc: "If users swipe away before 3 seconds, distribution stops. We generate three high-impact pattern-interrupt hooks to trap viewer attention instantly.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: "SEO-First Caps",
      desc: "Instagram behaves like a search engine. The model places searchable high-volume keywords inside the first two sentences so your content indexes under search.",
    },
    {
      icon: <Hash className="w-5 h-5 text-emerald-400" />,
      title: "Hashtag Minimalism",
      desc: "3 to 5 targeted niche hashtags are optimal. Large blocks of 30 generic tags trigger spam filters and dilute categorize signals.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      title: "Raw Authenticity",
      desc: "Casual talk on camera, green-screen effects, or low-fi daily smartphone recordings outperform over-produced ads because they build massive trust.",
    },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl transition-all hover:border-[#ff4f00]/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-base font-display font-medium text-white">Algorithmic Checkpoints</h3>
        <Sparkles className="w-4 h-4 text-[#ff4f00]" />
      </div>
      <div className="space-y-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex gap-4 p-4 hover:bg-white/[0.03] rounded-xl transition-all border border-transparent hover:border-white/5 group">
            <div className="flex-shrink-0 opacity-70 mt-0.5 group-hover:text-[#ff4f00] group-hover:opacity-100 transition-colors">{tip.icon}</div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-white">{tip.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px]">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
