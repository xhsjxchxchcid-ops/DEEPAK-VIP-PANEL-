import React, { useState, useRef } from 'react';
import { ParsedIssue } from '../../types/wingo';
import { LoginWarningModal } from '../SecurityLock/LoginWarningModal';
import { soundEffects } from '../../utils/audioEffects';

interface GameViewportProps {
  latestIssue?: ParsedIssue | null;
  gameType?: string;
  countdownSeconds?: number;
  onTriggerLoginWarning?: () => void;
  isRegistered?: boolean;
  onToggleRegistered?: (registered: boolean) => void;
}

export const GAME_URL = 'https://dmfirst.hackdev.club/#/register?invitationCode=674359223561';

export const GameViewport: React.FC<GameViewportProps> = ({
  onTriggerLoginWarning,
  isRegistered = false,
  onToggleRegistered,
}) => {
  const [iframeKey] = useState<number>(0);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Trigger login security warning (as seen in video and requested by user)
  const handleTriggerLoginWarning = () => {
    soundEffects.playWarningAlarm();
    soundEffects.playExecuteLaser();
    setShowWarningModal(true);
    if (onTriggerLoginWarning) {
      onTriggerLoginWarning();
    }
  };

  // Close warning modal and reload registration page
  const handleCloseAndRegister = () => {
    setShowWarningModal(false);
    if (onToggleRegistered) {
      onToggleRegistered(false);
    }
    if (iframeRef.current) {
      iframeRef.current.src = GAME_URL;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#051a12] overflow-hidden select-none">
      {/* 1. ACTUAL LIVE GAME EMBEDDED IN FULL SCREEN (URL: https://dmfirst.hackdev.club/#/register?invitationCode=674359223561) */}
      <iframe
        ref={iframeRef}
        key={iframeKey}
        src={GAME_URL}
        title="DmFirst WinGo Game"
        onLoad={() => setIsIframeLoading(false)}
        className="w-full h-full border-0 bg-[#051a12]"
        allow="autoplay; fullscreen; clipboard-write; encrypted-media"
      />

      {/* Loading placeholder while game iframe initializes */}
      {isIframeLoading && (
        <div className="absolute inset-0 bg-[#051c14] flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-[#e5ba64] border-t-transparent animate-spin mb-3" />
          <div className="font-cyber font-bold text-sm text-[#e5ba64] tracking-wider">
            LOADING DMFIRST GAME...
          </div>
          <div className="text-[10px] font-mono-terminal text-slate-400 mt-1">
            {GAME_URL}
          </div>
        </div>
      )}

      {/* 2. OVERLAY ON THE "I have an account Login" BUTTON (CIRCLED IN RED IN USER PHOTO 1000151902.jpg)
          Positioned precisely where "I have an account Login" is displayed in the mobile registration screen.
          When user taps this button:
          - Alarm Siren & Laser Sound effect plays!
          - Spoken voice announces: "Bhai ye private hack hai, to aap old UID ko login nahi kar sakte ho, to ek new number se ek new fresh account create kar lo!"
          - Video Security Warning Modal appears in front!
          - Login is strictly blocked! */}
      {!isRegistered && (
        <div
          className="absolute z-20 pointer-events-auto"
          style={{
            bottom: 'clamp(115px, 17vh, 180px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(92%, 370px)',
          }}
        >
          <button
            type="button"
            onClick={handleTriggerLoginWarning}
            className="w-full py-3 rounded-full bg-[#062118]/90 hover:bg-[#082a1f] border border-[#134533] text-sm text-slate-200 flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
            title="Attempt Login -> Triggers Security Warning Modal"
          >
            <span className="text-slate-300 font-medium">I have an account</span>
            <span className="text-[#e5ba64] font-bold">Login</span>
          </button>
        </div>
      )}

      {/* 3. LOGIN SECURITY WARNING MODAL (MATCHES VIDEO AT 00:16) */}
      <LoginWarningModal
        isOpen={showWarningModal}
        onCloseAndRegister={handleCloseAndRegister}
      />
    </div>
  );
};
