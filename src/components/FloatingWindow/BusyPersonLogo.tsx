import React from 'react';
import { Flame } from 'lucide-react';

interface BusyPersonLogoProps {
  onClick: () => void;
}

export const BusyPersonLogo: React.FC<BusyPersonLogoProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center justify-center p-2 rounded-full bg-gradient-to-b from-[#1c0206] via-[#100103] to-[#080002] border-2 border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.75),inset_0_0_15px_rgba(239,68,68,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer backdrop-blur-xl select-none"
      title="DEEPAK VIP PANEL (Tap to Open)"
      style={{ touchAction: 'none' }}
    >
      {/* Outer Rotating Glowing Ring */}
      <div className="absolute -inset-1 rounded-full border border-dashed border-red-500/40 animate-radar pointer-events-none" />

      {/* Circular Emblem Body */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border border-red-500/80 flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {/* Ambient Fire Glow in Bottom Half */}
        <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-orange-600/70 via-red-600/40 to-transparent pointer-events-none" />

        {/* Cyberpunk Silhouette Head with Glowing White Visor (from photo) */}
        <div className="relative flex flex-col items-center -mt-1">
          <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center relative shadow-sm">
            {/* Bright Glowing White Visor / Blindfold */}
            <div className="absolute top-2.5 w-6 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
          </div>
          {/* Black Hoodie Collar */}
          <div className="w-9 h-3.5 bg-neutral-900 rounded-t-lg -mt-1 border-t border-neutral-700" />
        </div>

        {/* "BUSY PERSON" Logo Overlay on Bottom of Emblem */}
        <div className="absolute bottom-1 flex flex-col items-center leading-none z-10 pointer-events-none">
          <div className="flex items-center -mb-0.5">
            <span
              style={{ fontFamily: "'Brush Script MT', 'cursive', sans-serif" }}
              className="text-[11px] font-bold italic text-[#ff4f87] drop-shadow-[0_0_6px_rgba(255,79,135,1)]"
            >
              Busy
            </span>
            <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500 animate-pulse -ml-0.5" />
          </div>
          <span className="font-cyber font-black tracking-widest text-[8px] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
            PERSON
          </span>
        </div>

        {/* Online Glowing Red Dot */}
        <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-ping" />
      </div>
    </div>
  );
};
