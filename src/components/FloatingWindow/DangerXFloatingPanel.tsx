import React, { useState, useRef, useEffect } from 'react';
import { ParsedIssue } from '../../types/wingo';
import { LotteryBall3D } from './LotteryBall3D';
import { BusyPersonLogo } from './BusyPersonLogo';
import { soundEffects } from '../../utils/audioEffects';
import {
  EyeOff,
  Radio,
  RefreshCw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Skull,
  Lock,
  Cpu,
  Flame,
} from 'lucide-react';

interface DangerXFloatingPanelProps {
  latestIssue: ParsedIssue | null;
  isLoading: boolean;
  onRefresh: () => void;
  countdownSeconds: number;
  isNewResultArrival: boolean;
  isOpen: boolean;
  onClose: () => void;
  onReopen: () => void;
  onExecuteBet?: (type: 'BIG' | 'SMALL') => void;
  onTriggerLoginWarning?: () => void;
  isRegistered?: boolean;
  onToggleRegistered?: (registered: boolean) => void;
}

export const DangerXFloatingPanel: React.FC<DangerXFloatingPanelProps> = ({
  latestIssue,
  isLoading,
  onRefresh,
  countdownSeconds,
  isNewResultArrival,
  isOpen,
  onClose,
  onReopen,
  onExecuteBet,
  onTriggerLoginWarning,
  isRegistered = false,
  onToggleRegistered,
}) => {
  // Panel States
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedPeriod, setCopiedPeriod] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(36);

  // Execution scanning flow ("Crimson Protocol" from photo 1000151885.jpg)
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isSignalUnlocked, setIsSignalUnlocked] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [revealedIssueNumber, setRevealedIssueNumber] = useState<string | null>(null);

  // Smooth dragging across screen
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 55 });
  const isDraggingRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });

  // Keep sound effects engine in sync
  useEffect(() => {
    soundEffects.enabled = soundEnabled;
  }, [soundEnabled]);

  // Simulate ultra-low live server ping (32ms - 42ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(Math.floor(32 + Math.random() * 12));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // When a brand new period lands, reset signal to ready state SILENTLY (do not speak automatically!)
  useEffect(() => {
    if (latestIssue && revealedIssueNumber && latestIssue.issueNumber !== revealedIssueNumber) {
      setIsSignalUnlocked(false);
      setRevealedIssueNumber(null);
      // DO NOT speak or chime automatically! Voice speaks ONLY when user taps EXECUTE!
    }
  }, [latestIssue?.issueNumber]);

  // Pointer dragging (works for mouse and touch seamlessly)
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    const maxX = window.innerWidth - (isMinimized ? 75 : 295);
    const maxY = window.innerHeight - (isMinimized ? 75 : 320);
    const newX = Math.max(5, Math.min(maxX, dragStartRef.current.posX + dx));
    const newY = Math.max(5, Math.min(maxY, dragStartRef.current.posY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleCopyPeriod = () => {
    soundEffects.playClickSound();
    if (latestIssue?.issueNumber) {
      navigator.clipboard.writeText(latestIssue.issueNumber);
      setCopiedPeriod(true);
      setTimeout(() => setCopiedPeriod(false), 2000);
    }
  };

  // EXECUTE FLOW:
  // If not registered yet, prompts to register first and speaks voice!
  const handleExecute = () => {
    if (isExecuting) return;

    if (!isRegistered) {
      soundEffects.playWarningAlarm();
      soundEffects.playExecuteLaser();
      soundEffects.speakRegisterRequiredVoice();
      return;
    }

    soundEffects.playExecuteLaser();
    setIsExecuting(true);
    setExecutionProgress(15);
    setTerminalLogs(['☣ Injecting crimson bypass...']);

    // In the floating window, only scanner beeps play while scanning, no connecting voice!
    // The voice speaks ONLY the signal result on reveal!

    // Step 2 (700ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setExecutionProgress(45);
      setTerminalLogs((prev) => [...prev, '☣ Establishing root pipeline...']);
    }, 700);

    // Step 3 (1500ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setExecutionProgress(75);
      setTerminalLogs((prev) => [...prev, '☣ Connecting AR-Lottery node...']);
    }, 1500);

    // Step 4 (2300ms)
    setTimeout(() => {
      soundEffects.playScanningBeep();
      setExecutionProgress(95);
      setTerminalLogs((prev) => [...prev, '☣ System Breach - EXPLOIT READY █']);
    }, 2300);

    // Final reveal step (3100ms): Reveals signal and SPEAKS RESULT!
    setTimeout(() => {
      setIsExecuting(false);
      setIsSignalUnlocked(true);
      setExecutionProgress(100);
      setRevealedIssueNumber(latestIssue?.issueNumber || null);

      const isBig = latestIssue ? latestIssue.isBig : false;
      const num = latestIssue ? latestIssue.rawNumber : null;

      // 1. Play crystal cyber fanfare chime
      soundEffects.playSignalRevealChime(isBig);

      // 2. Real voice announcement: "Deepak VIP Signal: BIG! Number 8!"
      soundEffects.speakSignalVoice(isBig, num);

      if (onExecuteBet && latestIssue) {
        onExecuteBet(latestIssue.isBig ? 'BIG' : 'SMALL');
      }
    }, 3100);
  };

  const handleHide = () => {
    soundEffects.playHideWoosh();
    setIsMinimized(true);
  };

  const handleLogoTap = () => {
    if (hasMovedRef.current) return;
    soundEffects.playOpenDeploy();
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          soundEffects.playClickSound();
          onReopen();
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500 text-red-200 font-cyber font-bold text-xs shadow-[0_0_25px_rgba(239,68,68,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        <span>OPEN DEEPAK VIP PANEL</span>
      </button>
    );
  }

  // MINIMIZED STATE: ONLY THE PURE "BUSY PERSON" LOGO FROM THE PHOTO!
  if (isMinimized) {
    return (
      <div
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none transition-transform duration-200"
      >
        <BusyPersonLogo onClick={handleLogoTap} />
      </div>
    );
  }

  // COMPACT & PREMIUM DEEPAK VIP PANEL
  const rawNumber = latestIssue ? latestIssue.rawNumber : 0;
  const issueColors: Array<'green' | 'red' | 'violet'> = latestIssue ? latestIssue.colors : ['red', 'violet'];

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-50 w-[275px] sm:w-[285px] flex flex-col rounded-[26px] bg-gradient-to-b from-[#190206] via-[#0f0103] to-[#070001] border-2 border-red-600/90 shadow-[0_0_35px_rgba(220,38,38,0.55),inset_0_0_15px_rgba(220,38,38,0.25)] backdrop-blur-xl overflow-hidden transition-all duration-300 select-none ${
        isNewResultArrival ? 'border-red-400 shadow-[0_0_50px_rgba(239,68,68,0.9)] scale-[1.02]' : ''
      }`}
    >
      {/* WINDOW HEADER & DRAG HANDLE */}
      <div
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="flex items-center justify-between px-3 pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing text-white"
      >
        {/* Title: DEEPAK VIP PANEL */}
        <div className="flex items-center gap-1.5 pointer-events-none">
          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          <span className="font-cyber font-black text-sm text-white tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            DEEPAK VIP PANEL
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">
          {/* Login Lock Warning Trigger */}
          {onTriggerLoginWarning && (
            <button
              onClick={() => {
                soundEffects.playClickSound();
                onTriggerLoginWarning();
              }}
              className="text-red-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Trigger Login Block Warning Modal (From Video)"
            >
              <Lock className="w-3.5 h-3.5 text-red-400 hover:text-red-200" />
            </button>
          )}

          {/* Sound / Voice Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              soundEffects.playClickSound();
            }}
            className="text-red-400 hover:text-white transition-colors cursor-pointer p-0.5"
            title={soundEnabled ? 'Mute Voice & Sound' : 'Enable Voice & Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={() => {
              soundEffects.playClickSound();
              onRefresh();
            }}
            disabled={isLoading}
            className="text-red-400 hover:text-white transition-colors cursor-pointer p-0.5"
            title="Refresh Live API"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Top Status Pill */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-sm ${
            isRegistered
              ? 'bg-[#082a17] border-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              : 'bg-[#2a1705] border-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isRegistered
                ? 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,1)]'
                : 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,1)]'
            }`} />
            <span className={`font-cyber font-bold text-[9px] tracking-wider ${
              isRegistered ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isRegistered ? 'VIP ACTIVE' : 'REGISTER'}
            </span>
          </div>
        </div>
      </div>

      {/* SUB-HEADER CARD: LINK ESTABLISHED / PERIOD / PING */}
      <div className="mx-2.5 mb-2 rounded-xl bg-[#130104] border border-red-950/80 p-2 flex items-center justify-between text-xs font-mono-terminal">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest">
            <span className={isRegistered ? 'text-emerald-400' : 'text-amber-400'}>
              {isRegistered ? '● IN GAME (VIP CONNECTED)' : '⚠ AUTH: REGISTER PAGE'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-black text-white text-xs tracking-wide">
              PERIOD: {latestIssue?.shortIssue || '10498'}
            </span>
            <button
              onClick={handleCopyPeriod}
              className="text-red-400 hover:text-red-200 transition-colors cursor-pointer"
              title="Copy Period"
            >
              {copiedPeriod ? <Check className="w-2.5 h-2.5 text-red-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* Live Latency & Countdown */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
            <span>{latencyMs}ms</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,1)]" />
          </div>
          <span className="text-[9px] text-amber-300">
            00:{String(countdownSeconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* CENTRAL RADAR TARGET FRAME WITH HUD BRACKETS */}
      <div className="relative mx-2.5 mb-2 rounded-xl bg-gradient-to-b from-[#140104] via-[#0b0103] to-[#060001] border border-red-900/60 p-3 overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
        {/* HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-500 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-500 pointer-events-none" />

        {/* Concentric Rotating Radar Rings */}
        <div className="absolute w-36 h-36 rounded-full border border-red-500/15 pointer-events-none animate-radar" />
        <div className="absolute w-24 h-24 rounded-full border border-dashed border-red-500/20 pointer-events-none" />
        <div className="absolute w-10 h-10 rounded-full border border-red-500/25 pointer-events-none" />

        {/* Laser Scanner Line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse-slow pointer-events-none" />

        {/* Ambient Red Glow in Center */}
        <div className="absolute w-24 h-24 rounded-full bg-red-600/15 blur-xl pointer-events-none" />

        {/* 1. CRIMSON PROTOCOL TERMINAL (MATCHING PHOTO 1000151885.jpg ON EXECUTE) */}
        {!isRegistered ? (
          /* 0. REGISTER REQUIRED STATE (ON LOGIN/REGISTER PAGE) */
          <div className="relative z-10 flex flex-col items-center justify-center py-2 text-center w-full animate-fade-in">
            {/* Animated Lock Shield with glow */}
            <div className="relative mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 via-red-950/80 to-black border-2 border-amber-500/70 flex items-center justify-center shadow-[0_0_22px_rgba(245,158,11,0.6)]">
                <Lock className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-black animate-ping" />
            </div>

            {/* PROMINENT "REGISTER" SIGNAL BADGE AS REQUESTED */}
            <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.85)] mb-2 animate-pulse-slow">
              <span className="font-cyber font-black tracking-widest text-xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                REGISTER
              </span>
            </div>

            <div className="text-[10px] font-cyber font-black text-amber-300 tracking-wider">
              SIGNAL: REGISTER FIRST
            </div>
            <div className="text-[9px] text-slate-300 font-mono-terminal mt-0.5 max-w-[210px] leading-tight">
              Game me fresh account register karein. Register hone ke baad signal chalu hoga!
            </div>

            {/* Fast Action: User has registered -> Go Inside Game */}
            {onToggleRegistered && (
              <button
                onClick={() => {
                  soundEffects.playOpenDeploy();
                  soundEffects.speakAccessGrantedVoice();
                  onToggleRegistered(true);
                }}
                className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500 text-emerald-300 hover:text-white text-[9px] font-mono-terminal font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>REGISTERED? ENTER GAME</span>
              </button>
            )}
          </div>
        ) : isExecuting ? (
          <div className="relative z-10 w-full flex flex-col items-center py-1 font-mono-terminal">
            {/* Header: Biohazard & CRIMSON PROTOCOL */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-red-500 text-sm animate-spin drop-shadow-[0_0_8px_rgba(239,68,68,1)]">☣</span>
              <span className="font-cyber font-black text-xs tracking-wider text-red-500">
                CRIMSON PROTOCOL
              </span>
            </div>

            <div className="text-[8px] text-slate-400 tracking-widest uppercase mb-1.5">
              OVERRIDE ENGINE V6.66 · ENCRYPTED
            </div>

            {/* Core Terminal Box with Prompt Lines */}
            <div className="w-full bg-black/90 rounded-lg p-2 border border-red-950/80 text-left text-[9px] text-red-300 space-y-1 shadow-inner">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest border-b border-red-950 pb-0.5 mb-1">
                -- CORE TERMINAL --
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-1 font-semibold">
                  <span>{log}</span>
                </div>
              ))}
            </div>

            {/* Overriding System Progress Bar */}
            <div className="w-full mt-2">
              <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold mb-0.5">
                <span>OVERRIDING SYSTEM</span>
                <span className="text-red-400">{executionProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-red-900/60">
                <div
                  style={{ width: `${executionProgress}%` }}
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
              </div>
            </div>

            {/* 4 Status Chips (from photo 1000151885.jpg) */}
            <div className="grid grid-cols-4 gap-1 w-full mt-2 text-[7px] text-center font-bold">
              <div className="bg-[#1e0205] border border-red-900 rounded py-0.5 text-slate-300">
                BYPASS
              </div>
              <div className="bg-[#2a0409] border border-red-500/80 rounded py-0.5 text-red-300 shadow-[0_0_6px_rgba(239,68,68,0.4)]">
                ROOT
              </div>
              <div className="bg-[#1e0205] border border-red-900 rounded py-0.5 text-slate-400">
                INJECT
              </div>
              <div className="bg-[#1e0205] border border-red-900 rounded py-0.5 text-slate-400">
                BREACH
              </div>
            </div>
          </div>
        ) : isSignalUnlocked ? (
          /* 2. UNLOCKED VIP SIGNAL DISPLAY */
          <>
            <div className="relative z-10 flex items-center justify-center gap-3 my-0.5">
              {/* 3D Glossy BIG / SMALL Button */}
              <div
                className={`glossy-btn-red px-4 py-2.5 rounded-xl flex items-center justify-center select-none shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-100 animate-pulse-slow`}
              >
                <span className="font-cyber font-black tracking-widest text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {latestIssue ? (latestIssue.isBig ? 'BIG' : 'SMALL') : 'SMALL'}
                </span>
              </div>

              {/* 3D Billiard / Lottery Ball */}
              <LotteryBall3D
                number={rawNumber}
                colors={issueColors}
                isNewResultArrival={isNewResultArrival}
                size={62}
              />
            </div>

            {/* BOTTOM PILL: ● ✓ SURESHOT */}
            <div className="relative z-10 mt-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#190104] border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.35)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)] animate-ping" />
              <span className="text-[10px] font-cyber font-black text-white tracking-wider flex items-center gap-1">
                ✓ SURESHOT
              </span>
              <span className="text-[9px] text-amber-300 font-mono-terminal ml-0.5">
                [{latestIssue ? latestIssue.twoDigitFormatted : '00'}]
              </span>
            </div>
          </>
        ) : (
          /* 3. LOCKED STATE BEFORE EXECUTION */
          <div className="relative z-10 flex flex-col items-center justify-center py-2 text-center">
            <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] mb-1.5 animate-pulse">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-xs font-cyber font-black text-white tracking-wider">
              VIP SIGNAL READY
            </div>
            <div className="text-[9px] text-red-300 font-mono-terminal mt-0.5">
              Tap EXECUTE to decrypt server draw
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTONS: EXECUTE & HIDE */}
      <div className="grid grid-cols-2 gap-2 mx-2.5 mb-2.5">
        {/* EXECUTE (Glossy 3D Red Button) */}
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className={`${
            !isRegistered
              ? 'bg-gradient-to-r from-amber-700 via-red-700 to-amber-700 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'glossy-btn-red'
          } py-2.5 rounded-xl font-cyber font-black tracking-wider text-xs text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md disabled:opacity-50`}
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>{isExecuting ? 'CONNECTING...' : !isRegistered ? 'EXECUTE (REGISTER)' : 'EXECUTE'}</span>
        </button>

        {/* HIDE (Glossy Glass Dark Button -> Minimizes into BUSY PERSON Logo) */}
        <button
          onClick={handleHide}
          className="glossy-btn-dark py-2.5 rounded-xl font-cyber font-black tracking-wider text-xs text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 border border-white/20"
          title="Hide into BUSY PERSON logo"
        >
          <EyeOff className="w-3.5 h-3.5 text-red-400" />
          <span>HIDE</span>
        </button>
      </div>
    </div>
  );
};
