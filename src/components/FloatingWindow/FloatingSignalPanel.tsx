import React, { useState, useRef, useEffect } from 'react';
import {
  ParsedIssue,
  StatisticalAnalysis,
  GameType,
  GAME_CONFIGS,
} from '../../types/wingo';
import { BigSmallSection } from '../BigSmallSection';
import { TwoDigitNumberSection } from '../TwoDigitNumberSection';
import { SignalHistoryTable } from '../SignalHistoryTable';
import { AndroidProjectViewer } from '../AndroidCodeExport/AndroidProjectViewer';
import {
  Minus,
  Maximize2,
  Minimize2,
  X,
  GripHorizontal,
  Sliders,
  Volume2,
  VolumeX,
  RefreshCw,
  Terminal,
  Activity,
  History,
  TrendingUp,
  Radio,
  Eye,
  Move,
  ChevronDown,
} from 'lucide-react';

interface FloatingSignalPanelProps {
  latestIssue: ParsedIssue | null;
  previousIssues: ParsedIssue[];
  analysis: StatisticalAnalysis;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
  networkError: string | null;
  gameType: GameType;
  onSelectGameType: (type: GameType) => void;
  countdownSeconds: number;
  isNewResultArrival: boolean;
  isOpen: boolean;
  onClose: () => void;
  onReopen: () => void;
}

export const FloatingSignalPanel: React.FC<FloatingSignalPanelProps> = ({
  latestIssue,
  previousIssues,
  analysis,
  isLoading,
  onRefresh,
  lastUpdated,
  networkError,
  gameType,
  onSelectGameType,
  countdownSeconds,
  isNewResultArrival,
  isOpen,
  onClose,
  onReopen,
}) => {
  // Window State
  const [windowMode, setWindowMode] = useState<'STANDARD' | 'MINIMIZED' | 'MAXIMIZED'>('STANDARD');
  const [activeTab, setActiveTab] = useState<'SIGNAL' | 'HISTORY' | 'ANALYTICS' | 'ANDROID_CODE'>('SIGNAL');
  const [opacity, setOpacity] = useState<number>(0.92);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showOpacitySlider, setShowOpacitySlider] = useState<boolean>(false);

  // Position and Size
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 70 });
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 380, height: 600 });

  // Dragging logic
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });

  // Resizing logic
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 380,
    height: 600,
  });

  // Play audio chime on new result arrival
  useEffect(() => {
    if (isNewResultArrival && soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch {
        // audio playback might be constrained by user gesture
      }
    }
  }, [isNewResultArrival, soundEnabled]);

  // Pointer / Drag event handlers
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if (windowMode === 'MAXIMIZED') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    } else if (isResizingRef.current) {
      const dw = e.clientX - resizeStartRef.current.x;
      const dh = e.clientY - resizeStartRef.current.y;
      setDimensions({
        width: Math.max(320, Math.min(window.innerWidth - 40, resizeStartRef.current.width + dw)),
        height: Math.max(400, Math.min(window.innerHeight - 60, resizeStartRef.current.height + dh)),
      });
    }
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
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Resize handle
  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
  };

  // If closed, render floating summon icon
  if (!isOpen) {
    return (
      <button
        onClick={onReopen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-black/90 border border-emerald-400 text-emerald-300 font-cyber font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span>OPEN NOVA SIGNAL PANEL</span>
      </button>
    );
  }

  // MINIMIZED STATE: Compact floating neon orb / pill
  if (windowMode === 'MINIMIZED') {
    return (
      <div
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity,
        }}
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/90 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] backdrop-blur-md">
          {/* Pulsing indicator */}
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />

          {/* Quick info */}
          <div className="flex items-center gap-2 font-mono-terminal text-xs">
            <span className="font-bold text-white">
              {latestIssue ? latestIssue.twoDigitFormatted : '--'}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                latestIssue?.isBig
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {latestIssue?.isBig ? 'BIG' : 'SML'}
            </span>
            <span className="text-[10px] text-amber-300">
              00:{String(countdownSeconds).padStart(2, '0')}
            </span>
          </div>

          {/* Expand & Close buttons */}
          <div className="flex items-center gap-1 ml-1 border-l border-emerald-950 pl-1.5">
            <button
              onClick={() => setWindowMode('STANDARD')}
              className="p-1 rounded hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 transition-colors"
              title="Expand Window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
              title="Close Panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD & MAXIMIZED WINDOW
  const isMax = windowMode === 'MAXIMIZED';

  return (
    <div
      style={{
        left: isMax ? '10px' : `${position.x}px`,
        top: isMax ? '10px' : `${position.y}px`,
        width: isMax ? 'calc(100vw - 20px)' : `${dimensions.width}px`,
        height: isMax ? 'calc(100vh - 20px)' : `${dimensions.height}px`,
        opacity,
      }}
      className={`fixed z-50 flex flex-col rounded-2xl bg-black/90 border-2 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.3)] backdrop-blur-xl overflow-hidden transition-shadow select-none ${
        isNewResultArrival ? 'border-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.7)]' : ''
      }`}
    >
      {/* WINDOW TITLE BAR & DRAG HANDLE */}
      <div
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-emerald-950/80 via-black to-emerald-950/80 border-b border-emerald-500/30 cursor-grab active:cursor-grabbing text-slate-200"
      >
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-cyber font-black tracking-wider text-xs text-white flex items-center gap-1">
              NOVA SIGNAL PANEL <span className="text-emerald-400">AI</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono-terminal">
              OVERLAY v2.4 · {GAME_CONFIGS[gameType].name}
            </span>
          </div>
        </div>

        {/* Center: Countdown pill */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[10px] font-mono-terminal text-amber-300">
          <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
          <span>00:{String(countdownSeconds).padStart(2, '0')}</span>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1">
          {/* Opacity toggle */}
          <button
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors"
            title="Adjust Panel Opacity"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors"
            title={soundEnabled ? 'Mute Alert Chime' : 'Enable Alert Chime'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-emerald-300 transition-colors"
            title="Manual API Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Minimize button */}
          <button
            onClick={() => setWindowMode('MINIMIZED')}
            className="p-1 rounded hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 transition-colors"
            title="Minimize to Floating Orb"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore button */}
          <button
            onClick={() => setWindowMode(isMax ? 'STANDARD' : 'MAXIMIZED')}
            className="p-1 rounded hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 transition-colors"
            title={isMax ? 'Restore Window' : 'Maximize Window'}
          >
            {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OPACITY SLIDER POPDOWN IF OPEN */}
      {showOpacitySlider && (
        <div className="bg-emerald-950/90 border-b border-emerald-900 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono-terminal">
          <span className="text-slate-300">Glass Transparency:</span>
          <div className="flex items-center gap-2 w-48">
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-emerald-300 font-bold">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* GAME MODE SELECTOR & TAB NAVIGATION */}
      <div className="bg-black/80 border-b border-emerald-950 px-2 py-1.5 flex items-center justify-between gap-1 text-xs font-mono-terminal">
        {/* Game Interval Selector */}
        <div className="relative">
          <select
            value={gameType}
            onChange={(e) => onSelectGameType(e.target.value as GameType)}
            className="bg-emerald-950/60 border border-emerald-500/40 rounded px-2 py-1 text-[11px] text-emerald-300 font-bold outline-none cursor-pointer"
          >
            <option value="WINGO_30S">Win Go 30s</option>
            <option value="WINGO_1M">Win Go 1Min</option>
            <option value="WINGO_3M">Win Go 3Min</option>
            <option value="WINGO_5M">Win Go 5Min</option>
          </select>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('SIGNAL')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              activeTab === 'SIGNAL'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Live Signal
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            History (100)
          </button>
          <button
            onClick={() => setActiveTab('ANDROID_CODE')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'ANDROID_CODE'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Android Kotlin</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY SCROLLABLE VIEW */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === 'SIGNAL' && (
          <>
            {/* BIG / SMALL SECTION */}
            <BigSmallSection
              latestIssue={latestIssue}
              previousIssues={previousIssues}
              analysis={analysis}
              isLoading={isLoading}
            />

            {/* TWO-DIGIT NUMBER SECTION */}
            <TwoDigitNumberSection
              latestIssue={latestIssue}
              previousIssues={previousIssues}
              hotNumbers={analysis.hotNumbers}
              coldNumbers={analysis.coldNumbers}
              isNewResultArrival={isNewResultArrival}
            />

            {/* TRANSPARENCY & DISCLAIMER NOTICE */}
            <div className="rounded-lg bg-black/60 border border-slate-800 p-2 text-[10px] text-slate-400 font-mono-terminal leading-normal">
              <span className="text-amber-400 font-bold block mb-0.5">
                ⚠ ACCURACY &amp; TRANSPARENCY STATEMENT:
              </span>
              This system parses actual verified draw data from <code className="text-emerald-300">draw.ar-lottery01.com</code>.
              Historical trends and Markov transition rates are mathematical models. Lottery draws are independent random events;
              no algorithm guarantees future outcomes. Trade responsibly.
            </div>
          </>
        )}

        {activeTab === 'HISTORY' && (
          <SignalHistoryTable
            issues={previousIssues}
            isLoading={isLoading}
            onRefresh={onRefresh}
            lastUpdated={lastUpdated}
            networkError={networkError}
          />
        )}

        {activeTab === 'ANDROID_CODE' && (
          <AndroidProjectViewer />
        )}
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="bg-black/90 border-t border-emerald-950 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono-terminal text-slate-400">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              networkError ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span>{networkError ? 'Reconnecting API...' : 'Live Stream Active'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Synced: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>

          {/* Resize Corner Handle (Standard Mode Only) */}
          {!isMax && (
            <div
              onPointerDown={handlePointerDownResize}
              className="cursor-nwse-resize text-emerald-500/60 hover:text-emerald-400 p-0.5"
              title="Drag to resize panel"
            >
              <Move className="w-3 h-3 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
