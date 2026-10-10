import React, { useState, useEffect } from 'react';
import { soundEffects } from '../../utils/audioEffects';
import { Zap, Lock, Skull, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CrimsonProtocolBootScreenProps {
  onComplete: () => void;
}

export const CrimsonProtocolBootScreen: React.FC<CrimsonProtocolBootScreenProps> = ({
  onComplete,
}) => {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; tag: string }>>([]);
  const [statusText, setStatusText] = useState<string>('SYSTEM INITIALIZING...');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('05:13:57');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const startBootSequence = () => {
    setHasStarted(true);
    soundEffects.playExecuteLaser();

    // 1. Spoken voice (Audio 1):
    // "Mere bhai hack ko server se connect kiya ja raha hai, connect hone ke baad maze se profit karna."
    soundEffects.speakHackConnecting();

    setStatusText('OVERRIDING SYSTEM');
    setProgress(15);
    setTerminalLogs([{ tag: 'INIT', text: '☣ Injecting crimson bypass... [PORT: 8080]' }]);

    // Step 2 (1400ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setProgress(45);
      setTerminalLogs((prev) => [
        ...prev,
        { tag: 'PIPELINE', text: '☣ Establishing root pipeline... [NODE-66]' },
      ]);
    }, 1400);

    // Step 3 (2800ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setProgress(75);
      setTerminalLogs((prev) => [
        ...prev,
        { tag: 'SYN-ACK', text: '☣ Connecting AR-Lottery server node... [ENCRYPTED]' },
      ]);
    }, 2800);

    // Step 4 (4200ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setProgress(95);
      setTerminalLogs((prev) => [
        ...prev,
        { tag: 'SUCCESS', text: '☣ System Breach - EXPLOIT READY █' },
      ]);
    }, 4200);

    // Step 5 (5200ms) - SUCCESS!
    setTimeout(() => {
      setProgress(100);
      setIsCompleted(true);
      setStatusText('ACCESS GRANTED - EXPLOIT CONNECTED');

      // Play victory chime
      soundEffects.playSignalRevealChime(true);

      // 2. Spoken voice (Audio 2):
      // "Hack taiyaar ho chuka hai, ab ek nayi UID create kar lo, tabhi hack aapko number prediction ke sath profit karke dega."
      soundEffects.speakHackConnected(() => {
        setTimeout(() => {
          onComplete();
        }, 1200);
      });

      // Auto-transition fallback
      setTimeout(() => {
        onComplete();
      }, 7500);
    }, 5200);
  };

  // Initial prompt before connection starts
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070102] cyber-grid flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden">
        {/* Holographic Laser Scanline */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scanline pointer-events-none" />

        {/* Glow circle */}
        <div className="absolute w-72 h-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

        {/* Biohazard Icon in double glowing circles */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-red-500/40 flex items-center justify-center animate-radar">
            <div className="w-16 h-16 rounded-full border border-dashed border-red-500/80 flex items-center justify-center animate-counter-radar">
              <span className="text-3xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)]">☣</span>
            </div>
          </div>
        </div>

        {/* CRIMSON PROTOCOL Header */}
        <h1 className="font-cyber font-black text-3xl sm:text-4xl text-white tracking-widest drop-shadow-[0_2px_10px_rgba(239,68,68,0.8)]">
          <span className="text-red-500">CRIMSON</span> PROTOCOL
        </h1>
        <p className="text-xs font-mono-terminal text-red-400 tracking-widest uppercase mt-1 mb-8">
          DEEPAK VIP OVERRIDE ENGINE V6.66 · ENCRYPTED
        </p>

        {/* Start Tap Button */}
        <button
          onClick={startBootSequence}
          className="glossy-btn-red px-8 py-3.5 rounded-2xl font-cyber font-black tracking-widest text-base text-white shadow-[0_0_35px_rgba(239,68,68,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>INITIALIZE VIP SERVER HACK</span>
        </button>
      </div>
    );
  }

  // EXACT FULL DISPLAY BOOT LOADING SCREEN (MATCHING PHOTO 1000151885.jpg)
  return (
    <div
      className={`fixed inset-0 z-50 bg-[#070102] cyber-grid flex flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-700 ${
        isCompleted ? 'opacity-95' : 'opacity-100'
      } select-none overflow-hidden`}
    >
      {/* Holographic Laser Scanline sweeping down screen */}
      <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,1)] animate-scanline pointer-events-none z-10" />

      {/* Background ambient red glow */}
      <div className="absolute w-96 h-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

      {/* Main Terminal Frame */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#180205] via-[#0d0103] to-[#060001] border-2 border-red-600/80 rounded-[32px] p-6 shadow-[0_0_50px_rgba(220,38,38,0.6),inset_0_0_20px_rgba(220,38,38,0.25)] flex flex-col items-center">
        {/* HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-500 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-500 pointer-events-none" />

        {/* Top Biohazard Symbol inside concentric dual counter-rotating red circles */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center animate-radar">
            <div className="w-12 h-12 rounded-full border border-dashed border-red-500/80 flex items-center justify-center bg-black/60 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-counter-radar">
              <span className="text-2xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]">☣</span>
            </div>
          </div>
        </div>

        {/* Title: CRIMSON PROTOCOL */}
        <h2 className="font-cyber font-black text-2xl text-white tracking-widest text-center">
          <span className="text-red-500">CRIMSON</span> PROTOCOL
        </h2>
        <div className="text-[9px] font-mono-terminal text-red-400 tracking-widest uppercase mt-0.5 mb-3 text-center">
          OVERRIDE ENGINE V6.66 · ENCRYPTED
        </div>

        {/* Breach Detection Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#200307] border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.4)] mb-4 font-mono-terminal text-[10px]">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-ping" />
          <span className="font-bold text-red-400">BREACH DETECTION</span>
          <span className="text-slate-400">NODE-66 · RESTRICTED {currentTimeStr}</span>
        </div>

        {/* CORE TERMINAL BOX (From Photo) */}
        <div className="w-full bg-black/90 rounded-2xl p-3.5 border border-red-950 font-mono-terminal text-xs text-red-300 space-y-2 shadow-inner mb-4 min-h-[120px] relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest border-b border-red-950/80 pb-1 mb-2">
            <span>-- CORE TERMINAL --</span>
            <span className="text-red-500 animate-pulse">● LIVE STREAM</span>
          </div>

          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between font-semibold text-[11px] leading-relaxed animate-fade-in">
              <span className="truncate">{log.text}</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-red-950 border border-red-900 text-red-400 flex-shrink-0 ml-1">
                {log.tag}
              </span>
            </div>
          ))}
        </div>

        {/* OVERRIDING SYSTEM PROGRESS BAR WITH ANIMATED BARBER POLE */}
        <div className="w-full mb-4 font-mono-terminal">
          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
            <span className="text-slate-300">{statusText}</span>
            <span className="text-red-400 font-black text-sm">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-red-900/80 p-0.5 relative">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(239,68,68,1)] animate-barber-pole"
            />
          </div>
        </div>

        {/* 4 ACTION CHIPS (From Photo: BYPASS, ROOT, INJECT, BREACH) */}
        <div className="grid grid-cols-4 gap-2 w-full mb-3 text-[9px] font-mono-terminal text-center font-bold">
          <div
            className={`rounded-xl py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
              progress >= 15
                ? 'bg-[#250307] border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : 'bg-[#180205] border border-red-900/80 text-slate-400'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>BYPASS</span>
          </div>

          <div
            className={`rounded-xl py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
              progress >= 45
                ? 'bg-[#2a0409] border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-[#180205] border border-red-900/80 text-slate-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>ROOT</span>
          </div>

          <div
            className={`rounded-xl py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
              progress >= 75
                ? 'bg-[#2a0409] border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-[#180205] border border-red-900/80 text-slate-400'
            }`}
          >
            <span className="text-xs">☣</span>
            <span>INJECT</span>
          </div>

          <div
            className={`rounded-xl py-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
              progress >= 95
                ? 'bg-[#2a0409] border border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-[#180205] border border-red-900/80 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>BREACH</span>
          </div>
        </div>

        {/* Enter Game Button on completion */}
        {isCompleted && (
          <button
            onClick={onComplete}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-cyber font-black text-xs tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.8)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ENTER GAME &amp; LAUNCH VIP PANEL</span>
          </button>
        )}

        {/* Footer info */}
        <div className="text-[8px] font-mono-terminal text-slate-500 text-center uppercase tracking-widest mt-2">
          © 2026 CRIMSON OVERRIDE SYSTEM · RESTRICTED ACCESS
        </div>
      </div>
    </div>
  );
};
