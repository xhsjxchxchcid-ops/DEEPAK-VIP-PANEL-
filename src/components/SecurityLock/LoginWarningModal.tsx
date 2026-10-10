import React, { useEffect } from 'react';
import { soundEffects } from '../../utils/audioEffects';
import { Lock, AlertTriangle, ShieldX, X, Volume2 } from 'lucide-react';

interface LoginWarningModalProps {
  isOpen: boolean;
  onCloseAndRegister: () => void;
}

export const LoginWarningModal: React.FC<LoginWarningModalProps> = ({
  isOpen,
  onCloseAndRegister,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEffects.playWarningAlarm();
      soundEffects.playExecuteLaser();
      // Speak the exact Hindi voice from the video!
      soundEffects.speakLoginWarning();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseAndRegister();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCloseAndRegister]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onCloseAndRegister}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
    >
      {/* Background ambient red glow aura */}
      <div className="absolute w-80 h-80 rounded-full bg-red-600/25 blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Warning Card Frame (Matches Video at 00:16) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[330px] rounded-[28px] bg-gradient-to-b from-[#1e0205] via-[#110103] to-[#080001] border-2 border-red-600 shadow-[0_0_45px_rgba(239,68,68,0.75),inset_0_0_18px_rgba(239,68,68,0.3)] p-5 flex flex-col items-center text-center animate-scale-up"
      >
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between mb-3 border-b border-red-950/80 pb-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldX className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="font-cyber font-black text-xs text-white tracking-wider">
              DMFIRST NUMBER X APK
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* AUTO Pill Tag (from video) */}
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-terminal font-black bg-red-600/30 text-red-300 border border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.4)]">
              AUTO
            </span>

            {/* Close Button */}
            <button
              onClick={onCloseAndRegister}
              className="text-red-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Close and Register"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Warning Icon Badge */}
        <div className="relative my-1">
          <div className="w-14 h-14 rounded-full bg-red-950/70 border-2 border-red-500/60 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
            <Lock className="w-7 h-7 text-red-500" />
          </div>
        </div>

        {/* ACCESS LOCKED Glowing Header */}
        <div className="my-2 space-y-1">
          <div className="text-2xl font-cyber font-black tracking-widest text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)] animate-pulse">
            ACCESS LOCKED
          </div>
          <div className="text-[10px] font-mono-terminal text-slate-300 tracking-wider uppercase font-bold">
            REGISTER OR LOGIN TO CONTINUE
          </div>
        </div>

        {/* Spoken Warning Summary */}
        <div className="my-2.5 w-full bg-black/75 p-3 rounded-2xl border border-red-900/60 shadow-inner text-left space-y-1.5 font-mono-terminal">
          <div className="flex items-start gap-1.5 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span className="text-white text-[11px] font-semibold leading-snug">
              Bhai yeh private VIP hack hai, old UID login nahi ho sakti!
            </span>
          </div>
          <p className="text-[10px] text-red-300/90 leading-relaxed pl-5">
            Ek new number se fresh account register karein taaki server sync ho sake.
          </p>
        </div>

        {/* Voice replay button */}
        <button
          onClick={() => soundEffects.speakLoginWarning()}
          className="flex items-center gap-1.5 text-[10px] font-mono-terminal text-red-400 hover:text-red-200 transition-colors py-1 cursor-pointer mb-2"
          title="Replay warning voice"
        >
          <Volume2 className="w-3 h-3 text-red-400" />
          <span>Replay Voice Announcement</span>
        </button>

        {/* REGISTER Red 3D Button (From Video) */}
        <button
          onClick={onCloseAndRegister}
          className="w-full glossy-btn-red py-3 rounded-2xl font-cyber font-black tracking-widest text-sm text-white shadow-[0_0_25px_rgba(239,68,68,0.9)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
        >
          <Lock className="w-4 h-4 fill-white" />
          <span>REGISTER NEW UID</span>
        </button>
      </div>
    </div>
  );
};
