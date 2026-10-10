import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParsedIssue } from './types/wingo';
import { fetchWingoHistory } from './services/wingoApi';
import { DangerXFloatingPanel } from './components/FloatingWindow/DangerXFloatingPanel';
import { GameViewport } from './components/GameSimulator/GameViewport';
import { CrimsonProtocolBootScreen } from './components/LoadingScreen/CrimsonProtocolBootScreen';
import { LoginWarningModal } from './components/SecurityLock/LoginWarningModal';
import { soundEffects } from './utils/audioEffects';
import { Radio, RefreshCw } from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState<ParsedIssue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Full-Display Boot Loading Screen State
  const [isBootComplete, setIsBootComplete] = useState<boolean>(false);

  // Auth / Registration State:
  // false = user is on Login/Register page -> Signal displays "REGISTER" & Login button triggers warning
  // true = user registered and entered game -> "REGISTER" is removed and live signals start!
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Floating Window Controls
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(true);

  // Login Warning Modal State (From Video)
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const handleTriggerLoginWarning = () => {
    soundEffects.playWarningAlarm();
    soundEffects.playExecuteLaser();
    setShowWarningModal(true);
  };

  // Countdown & issue arrival triggers
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);
  const [isNewResultArrival, setIsNewResultArrival] = useState<boolean>(false);
  const prevLatestIssueRef = useRef<string | null>(null);

  // Load WinGo history from real API
  const loadHistory = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const result = await fetchWingoHistory('WINGO_1M', 20);
      setNetworkError(null);

      if (result.issues.length > 0) {
        const newest = result.issues[0];
        // Check if fresh issue arrived
        if (prevLatestIssueRef.current && prevLatestIssueRef.current !== newest.issueNumber) {
          setIsNewResultArrival(true);
          setTimeout(() => setIsNewResultArrival(false), 3000);
        }
        prevLatestIssueRef.current = newest.issueNumber;

        setIssues(result.issues);
      }
    } catch (err) {
      console.error('WinGo API poll error:', err);
      setNetworkError((err as Error).message || 'Failed to fetch draw results');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Periodic Polling loop (every 3 seconds)
  useEffect(() => {
    loadHistory(true);
    const pollInterval = setInterval(() => {
      loadHistory(false);
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [loadHistory]);

  // Countdown clock synced with 60s rounds
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentSec = now.getSeconds();
      const remaining = 60 - (currentSec % 60);
      setCountdownSeconds(remaining === 0 ? 60 : remaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const latestIssue = issues.length > 0 ? issues[0] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. FULL DISPLAY BOOT LOADING SCREEN (BEFORE GAME) */}
      {!isBootComplete && (
        <CrimsonProtocolBootScreen
          onComplete={() => setIsBootComplete(true)}
        />
      )}

      {/* 2. FULL SCREEN GAME (dmfirst.hackdev.club) */}
      <div className="w-full h-full">
        <GameViewport
          latestIssue={latestIssue}
          gameType="WINGO_1M"
          countdownSeconds={countdownSeconds}
          onTriggerLoginWarning={handleTriggerLoginWarning}
          isRegistered={isRegistered}
          onToggleRegistered={setIsRegistered}
        />
      </div>

      {/* 3. DEEPAK VIP PANEL (FLOATING OVER THE GAME) */}
      {isBootComplete && (
        <DangerXFloatingPanel
          latestIssue={latestIssue}
          isLoading={isLoading}
          onRefresh={() => loadHistory(false)}
          countdownSeconds={countdownSeconds}
          isNewResultArrival={isNewResultArrival}
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          onReopen={() => setIsOverlayOpen(true)}
          onTriggerLoginWarning={handleTriggerLoginWarning}
          isRegistered={isRegistered}
          onToggleRegistered={setIsRegistered}
        />
      )}

      {/* 4. LOGIN WARNING POPUP MODAL (FROM VIDEO) */}
      <LoginWarningModal
        isOpen={showWarningModal}
        onCloseAndRegister={() => {
          setShowWarningModal(false);
          setIsRegistered(false);
        }}
      />

      {/* DISCREET REBOOT TRIGGER IN TOP-LEFT IF USER WANTS TO RE-CONNECT */}
      {isBootComplete && (
        <button
          onClick={() => setIsBootComplete(false)}
          className="fixed top-2 left-2 z-30 p-1.5 rounded-full bg-black/70 hover:bg-red-950/80 border border-red-900/40 text-red-400 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 font-mono-terminal backdrop-blur-md opacity-40 hover:opacity-100"
          title="Re-run Server Hack Connection"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}

      {/* DISCREET BOTTOM CORNER QUICK TOGGLE IF PANEL IS CLOSED */}
      {isBootComplete && !isOverlayOpen && (
        <button
          onClick={() => setIsOverlayOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500 text-white font-cyber font-black text-xs shadow-[0_0_30px_rgba(239,68,68,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span>OPEN DEEPAK VIP PANEL</span>
        </button>
      )}
    </div>
  );
}
