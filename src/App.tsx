import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  History, 
  Bookmark, 
  Plus, 
  Trash2, 
  Instagram, 
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  TrendingUp,
  Flame,
  Globe,
  Star,
  Mic,
  MicOff,
  Volume2
} from "lucide-react";
import { InstagramPlan, SavedPlan } from "./types";
import AlgorithmTips from "./components/AlgorithmTips";
import InstagramFeedPreview from "./components/InstagramFeedPreview";
import StrategyOutput from "./components/StrategyOutput";

const PRESET_IDEAS = [
  {
    label: "💸 Budget Cook (Malayalam)",
    text: "Njan oru puthiya biriyani recipe undakkan povanu, pakshe budget valare kuravanu. Home bakes cheyyunnavarkkum vilpanaykkum pattiya reethiyil engane viral aakkam?",
    vibe: "High-Value Tutorial"
  },
  {
    label: "⛰️ Hidden Waterfall (Manglish)",
    text: "Wayanad-ile aarkkum ariyatha oru hidden waterfall parayanulla mini vlog idea aanu. Locals mathrame avide pokaruള്ളൂ. Sunset-um kidilam aanu.",
    vibe: "Shocking Curiosity"
  },
  {
    label: "💻 Kid's Coding Course (Malayalam)",
    text: "Kuttikalkkayulla free Python coding workshop promote cheyyanam. Work from home cheyyunna parents-ine connect cheyyunna reethi aavanam.",
    vibe: "Relatable Storytelling"
  },
  {
    label: "🍿 Cinema Review (Manglish)",
    text: "Puthiya release aya movie kandit enik ishtapettilla, pakshe ellavarum nallathanu parayunne. Negative review valare comedy standard il engane parayam?",
    vibe: "Comedic Relief"
  }
];

export default function App() {
  const [idea, setIdea] = useState("");
  const [vibe, setVibe] = useState("High-Value Tutorial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState("ml-IN"); // ml-IN for Malayalam, en-IN for Manglish/English
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition Hook
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsRecording(true);
      setVoiceStatus("Listening... Speak now!");
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setIdea((prev) => {
          const separator = prev.trim() ? " " : "";
          return prev + separator + finalTranscript;
        });
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setVoiceStatus("Permission denied. Ensure microphone is active.");
      } else {
        setVoiceStatus(`Error: ${event.error}`);
      }
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    setRecognition(rec);
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      try {
        recognition.stop();
        setIsRecording(false);
        setVoiceStatus(null);
      } catch (e) {
        console.error(e);
      }
    } else {
      setVoiceStatus("Starting microphone...");
      try {
        recognition.lang = voiceLang;
        recognition.start();
      } catch (e) {
        console.error(e);
        setVoiceStatus("Microphone error. Please refresh and try again.");
      }
    }
  };
  
  // Realtime generated output plan
  const [plan, setPlan] = useState<InstagramPlan | null>(null);
  const [activeHookType, setActiveHookType] = useState<"curiosity" | "visual" | "relatable">("curiosity");

  // Local storage lists of saved draft plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [hasCopied, setHasCopied] = useState(false);
  
  // Video Analysis States
  const [mode, setMode] = useState<"strategy" | "video">("strategy");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<{ caption: string, keywords: string[], tags: string[] } | null>(null);

  // Load saved strategies from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("instagram_partner_plans");
      if (saved) {
        setSavedPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved strategic logs from localStorage:", e);
    }
  }, []);

  // Save list state to localStorage helper
  const updateSavedPlans = (newPlans: SavedPlan[]) => {
    setSavedPlans(newPlans);
    try {
      localStorage.setItem("instagram_partner_plans", JSON.stringify(newPlans));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  };

  // Process and generate the strategic strategy via server API
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, vibe }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reach Strategy Engine.");
      }

      const data: InstagramPlan = await response.json();
      setPlan(data);
      setActiveHookType("curiosity"); // default to curiosity first
    } catch (err: any) {
      console.error("Strategic generation error", err);
      setError(err.message || "An unexpected error occurred while communicating with the server.");
    } finally {
      setLoading(false);
    }
  };

  // Add currently viewed generated plan to Saved Local Plans
  const handleSavePlan = () => {
    if (!plan || !idea) return;

    // Check if current idea is already saved
    const exists = savedPlans.some((p) => p.plan.translatedConcept === plan.translatedConcept);
    if (exists) return;

    const newSavedItem: SavedPlan = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      idea: idea,
      vibe: vibe,
      plan: plan,
      isFavorite: false
    };

    const updated = [newSavedItem, ...savedPlans];
    updateSavedPlans(updated);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedPlans.filter((p) => p.id !== id);
    updateSavedPlans(filtered);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlans.map((p) => {
      if (p.id === id) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    updateSavedPlans(updated);
  };

  const handleSelectSaved = (saved: SavedPlan) => {
    setIdea(saved.idea);
    setVibe(saved.vibe);
    setPlan(saved.plan);
    setActiveHookType("curiosity");
  };

  const handleAnalyzeVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze video.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setVideoAnalysis(data.result || data);
    } catch (err: any) {
      console.error("Video analysis error", err);
      setError(err.message || "An unexpected error occurred during video analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 flex flex-col font-sans selection:bg-[#ff4f00]/30 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient Orbs Background (Theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] md:-top-[20%] left-[-20%] md:-left-[10%] w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff4f00]/20 via-[#ff4f00]/5 to-transparent blur-[100px] md:blur-[140px]" />
        <div className="absolute bottom-[-10%] md:top-[40%] right-[-20%] md:-right-[20%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff2a00]/15 via-[#ff2a00]/5 to-transparent blur-[100px] md:blur-[140px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full">
        {/* Minimal Header */}
        <header className="sticky top-0 z-40 bg-[#050505]/40 backdrop-blur-2xl border-b border-white/5 py-5 px-6 lg:px-10 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Instagram className="w-5 h-5 text-[#ff4f00]" />
            <h1 className="text-sm font-display font-medium text-white tracking-widest">
              ALTER<span className="text-[#ff4f00]">CALL</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {/* Action buttons removed */}
          </div>
        </header>

        {/* Main Body Layout */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Input Strategy (Span 4) */}
        <section className="lg:col-span-4 flex flex-col gap-8">
          
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-display font-normal text-white tracking-tight leading-tight">
                AI-powered <span className="text-[#ff4f00]">coaching</span><br />
                content for <span className="text-[#ff4f00]">creators</span>.
              </h2>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-sm mt-4">
                Describe your video concept in Malayalam or Manglish. We will generate high retention hooks and scripts.
              </p>
            </div>

            {/* Main Form input */}
            
            <div className="flex bg-white/5 p-1 rounded-full w-max mb-2">
              <button onClick={() => setMode("strategy")} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "strategy" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>Strategy Gen</button>
              <button onClick={() => setMode("video")} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "video" ? "bg-[#ff4f00] text-white shadow-[0_0_15px_rgba(255,79,0,0.4)]" : "text-zinc-400 hover:text-white"}`}>Video Captioner</button>
            </div>

            {mode === "strategy" ? (
            <>
            <form onSubmit={handleGenerate} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-300">Idea Input</span>
                  <span className={`font-mono ${idea.length > 300 ? "text-amber-500/70" : "text-zinc-600"}`}>
                    {idea.length} / 500
                  </span>
                </div>
                
                {/* Voice Module & Text Container */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden focus-within:border-white/10 transition-colors">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff4f00]">Dictation</span>
                      <div className="flex items-center bg-white/5 p-0.5 rounded-full gap-0.5 border border-white/5">
                        <button
                          type="button"
                          onClick={() => setVoiceLang("ml-IN")}
                          className={`px-3 py-1 text-[10px] rounded-full font-mono transition-colors ${
                            voiceLang === "ml-IN" ? "bg-white text-black font-semibold shadow" : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          MAL
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoiceLang("en-IN")}
                          className={`px-3 py-1 text-[10px] rounded-full font-mono transition-colors ${
                            voiceLang === "en-IN" ? "bg-white text-black font-semibold shadow" : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          ENG
                        </button>
                      </div>
                    </div>
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isRecording ? "bg-[#ff4f00]/20 text-[#ff4f00] shadow-[0_0_15px_rgba(255,79,0,0.2)]" : "bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300"
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ff4f00] animate-pulse" />
                            <span>Listening...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-[#ff4f00]" />
                            <span>Voice Input</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Type or speak your idea here..."
                    rows={5}
                    className="w-full bg-transparent p-5 text-sm text-zinc-100 focus:outline-none resize-none placeholder-zinc-600 leading-relaxed font-medium"
                  />
                </div>
              </div>

              {/* Vibe Selection */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-zinc-300">Tone & Intent</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Tutorial",
                    "Curiosity",
                    "Storytelling",
                    "Comedy"
                  ].map((option, idx) => {
                    const fullVibeObj = [
                      "High-Value Tutorial",
                      "Shocking Curiosity",
                      "Relatable Storytelling",
                      "Comedic Relief"
                    ];
                    const fullVibe = fullVibeObj[idx];
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setVibe(fullVibe)}
                        className={`px-3 py-2.5 text-xs rounded-full border transition-all ${
                          vibe === fullVibe
                            ? "bg-gradient-to-r from-[#ff4f00] to-[#ff7300] border-transparent text-white shadow-[0_4px_10px_rgba(255,79,0,0.2)] font-medium"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !idea.trim()}
                className={`w-full py-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/10"
                    : !idea.trim()
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5"
                    : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                }`}
              >
                {loading ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Generating Protocol...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#ff4f00]" />
                    Access AI Strategy
                  </>
                )}
              </button>
            </form>
            </>
            ) : (
            <form onSubmit={handleAnalyzeVideo} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-zinc-300">Upload Video</span>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-colors rounded-xl cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-zinc-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-zinc-500">MP4, MOV, WEBM (Max. 50MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setVideoFile(file);
                  }} />
                </label>
                {videoFile && (
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 flex justify-between items-center">
                    <span className="truncate max-w-[200px]">{videoFile.name}</span>
                    <button type="button" onClick={() => setVideoFile(null)} className="text-zinc-500 hover:text-white transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !videoFile}
                className={`w-full py-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/10"
                    : !videoFile
                    ? "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5"
                    : "bg-[#ff4f00] text-white hover:bg-[#ff7300] shadow-[0_0_20px_rgba(255,79,0,0.3)]"
                }`}
              >
                {loading ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#ff4f00]/30 border-t-white rounded-full animate-spin" />
                    Analyzing Deep Hooks...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    Auto-Caption Video
                  </>
                )}
              </button>
            </form>
            )}
          </div>

          {/* Minimal Quick Presets */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Quick Starters</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_IDEAS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                     setIdea(preset.text);
                     setVibe(preset.vibe);
                  }}
                  className="px-3 py-1.5 text-xs text-zinc-300 bg-white/[0.02] hover:bg-white/[0.05] rounded-full border border-white/5 transition-colors"
                >
                  {preset.label.replace(/ \(.*?\)/, '')}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Drafts */}
          {savedPlans.length > 0 && (
            <div className="pt-6 border-t border-white/5 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#ff4f00]">Saved Drafts</span>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {savedPlans.map((saved) => (
                  <div key={saved.id} className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={() => handleSelectSaved(saved)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-zinc-500 font-mono">{saved.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => handleToggleFavorite(saved.id, e)} className="text-zinc-500 hover:text-[#ff4f00] transition">
                          <Star className={`w-3.5 h-3.5 ${saved.isFavorite ? "fill-[#ff4f00] text-[#ff4f00]" : ""}`} />
                        </button>
                        <button onClick={(e) => handleDeleteSaved(saved.id, e)} className="text-zinc-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">{saved.idea}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-medium text-zinc-400">{saved.vibe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: Output (Span 8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {mode === "strategy" ? (
            !plan ? (
              <div className="h-full min-h-[500px] w-full flex items-center justify-center relative">
                {/* Optional glowing frame for empty state */}
                <div className="absolute inset-0 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm -z-10" />
                <div className="flex flex-col items-center justify-center text-center p-10">
                  <div className="w-16 h-16 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-[#ff4f00]" />
                  </div>
                  <h3 className="text-xl font-display text-white mb-2">Awaiting Input</h3>
                  <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                    Provide your concept. The system will format a viral structure optimized for high retention and saves.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 fade-in">
                {/* Output Actions Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-medium text-zinc-100">
                    Strategic Output
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSavePlan}
                      className="px-4 py-1.5 bg-white border border-white rounded-full text-xs font-medium text-black transition-all hover:bg-zinc-200"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdea("");
                        setPlan(null);
                      }}
                      className="px-4 py-1.5 bg-transparent border border-white/10 hover:bg-white/5 rounded-full text-xs text-zinc-300 transition-colors"
                    >
                      Clear Setup
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                  {/* Left: Component View */}
                  <div className="w-full">
                    <InstagramFeedPreview 
                      plan={plan} 
                      activeHookType={activeHookType}
                      onSelectHookType={setActiveHookType}
                    />
                  </div>
                  {/* Right: Strategy Details */}
                  <div className="w-full">
                    <StrategyOutput 
                      plan={plan} 
                      activeHookType={activeHookType}
                      onSelectHookType={setActiveHookType}
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
             !videoAnalysis ? (
               <div className="h-full min-h-[500px] w-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm -z-10" />
                 <div className="flex flex-col items-center justify-center text-center p-10">
                   <div className="w-16 h-16 rounded-full bg-[#ff4f00]/10 border border-[#ff4f00]/30 flex items-center justify-center mb-6">
                     <Instagram className="w-6 h-6 text-[#ff4f00]" />
                   </div>
                   <h3 className="text-xl font-display text-white mb-2">Video Auto-Caption</h3>
                   <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                     Upload a video to automatically generate algorithm-optimized captions, tags, and deep-researched keywords.
                   </p>
                 </div>
               </div>
             ) : (
               <div className="flex items-start justify-center h-full sm:pt-6">
                 <div className="w-full max-w-2xl bg-zinc-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-lg flex flex-col gap-8 shadow-2xl relative">
                   <h3 className="text-2xl font-display text-white flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-[#ff4f00]"/> Optimized Metadata
                   </h3>
                   
                   <div className="flex flex-col gap-4">
                     <div className="flex justify-between items-center">
                       <h4 className="text-xs font-mono uppercase tracking-widest text-[#ff4f00]">Suggested Caption</h4>
                       <button onClick={() => {
                         navigator.clipboard.writeText(videoAnalysis.caption);
                         setHasCopied(true);
                         setTimeout(() => setHasCopied(false), 2000);
                       }} className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white transition">
                         {hasCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                         {hasCopied ? 'Copied' : 'Copy'}
                       </button>
                     </div>
                     <div className="bg-black/30 p-5 rounded-xl border border-white/5 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                       {videoAnalysis.caption}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Targeted Keywords</h4>
                        <div className="flex flex-col gap-2">
                          {videoAnalysis.keywords.map((kw, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 flex items-center justify-between group cursor-pointer hover:bg-white/10"
                                onClick={() => navigator.clipboard.writeText(kw)}>
                              <span>{kw}</span>
                              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                            </div>
                          ))}
                        </div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Perfect Hashtags</h4>
                        <div className="flex flex-wrap gap-2">
                          {videoAnalysis.tags.map((tag, idx) => (
                            <span key={idx} className="bg-[#ff4f00]/10 text-[#ff4f00] border border-[#ff4f00]/20 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-[#ff4f00]/20 transition-colors"
                                onClick={() => navigator.clipboard.writeText(tag)}>
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                     </div>
                   </div>

                   <button onClick={() => {
                        setVideoAnalysis(null);
                        setVideoFile(null);
                      }} 
                      className="mt-4 px-5 py-2.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium text-white rounded-full w-max mx-auto">
                     Analyze Another Video
                   </button>
                 </div>
               </div>
             )
          )}
        </section>

      </main>
      </div>  
    </div>
  );
}
