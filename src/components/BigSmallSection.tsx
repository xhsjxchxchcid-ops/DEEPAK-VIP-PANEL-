import React from 'react';
import { ParsedIssue, StatisticalAnalysis } from '../types/wingo';
import { TrendingUp, TrendingDown, Activity, Sparkles, ShieldCheck } from 'lucide-react';

interface BigSmallSectionProps {
  latestIssue: ParsedIssue | null;
  previousIssues: ParsedIssue[];
  analysis: StatisticalAnalysis;
  isLoading: boolean;
}

export const BigSmallSection: React.FC<BigSmallSectionProps> = ({
  latestIssue,
  previousIssues,
  analysis,
  isLoading,
}) => {
  const isBig = latestIssue ? latestIssue.isBig : false;
  const isSmall = latestIssue ? latestIssue.isSmall : false;
  const streak = analysis.currentStreak;
  const prediction = analysis.statisticalNextPrediction;

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono-terminal">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-emerald-400 font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          BIG / SMALL INDICATOR
        </span>
        <span className="text-[11px] text-slate-500">
          Period: <span className="text-emerald-300 font-semibold">{latestIssue?.issueNumber || 'WAITING'}</span>
        </span>
      </div>

      {/* DUAL GLOWING INDICATOR CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* BIG CARD */}
        <div
          className={`relative overflow-hidden rounded-xl p-3 border transition-all duration-300 ${
            isBig
              ? 'bg-gradient-to-br from-emerald-950/90 to-black/90 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.01]'
              : 'bg-black/60 border-emerald-950/40 text-slate-500 opacity-60 hover:opacity-80'
          }`}
        >
          {isBig && (
            <div className="absolute top-1.5 right-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono-terminal bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              High Range (5-9)
            </span>
            <TrendingUp className={`w-3.5 h-3.5 ${isBig ? 'text-emerald-400' : 'text-slate-600'}`} />
          </div>

          <div className="flex items-baseline justify-between">
            <div
              className={`text-2xl font-black font-cyber tracking-wider ${
                isBig ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-slate-500'
              }`}
            >
              BIG
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono-terminal">Rate 100 Issue</div>
              <div className="text-xs font-bold text-emerald-400 font-mono-terminal">
                {analysis.bigPercentage}%
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[10px] text-slate-400">
            <span>Historical Count</span>
            <span className="font-mono-terminal text-slate-200 font-semibold">{analysis.bigCount} wins</span>
          </div>
        </div>

        {/* SMALL CARD */}
        <div
          className={`relative overflow-hidden rounded-xl p-3 border transition-all duration-300 ${
            isSmall
              ? 'bg-gradient-to-br from-rose-950/90 to-black/90 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.01]'
              : 'bg-black/60 border-rose-950/30 text-slate-500 opacity-60 hover:opacity-80'
          }`}
        >
          {isSmall && (
            <div className="absolute top-1.5 right-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono-terminal bg-rose-500/20 text-rose-300 border border-rose-500/40">
                ACTIVE
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Low Range (0-4)
            </span>
            <TrendingDown className={`w-3.5 h-3.5 ${isSmall ? 'text-rose-400' : 'text-slate-600'}`} />
          </div>

          <div className="flex items-baseline justify-between">
            <div
              className={`text-2xl font-black font-cyber tracking-wider ${
                isSmall ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'text-slate-500'
              }`}
            >
              SMALL
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono-terminal">Rate 100 Issue</div>
              <div className="text-xs font-bold text-rose-400 font-mono-terminal">
                {analysis.smallPercentage}%
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-rose-900/40 flex items-center justify-between text-[10px] text-slate-400">
            <span>Historical Count</span>
            <span className="font-mono-terminal text-slate-200 font-semibold">{analysis.smallCount} wins</span>
          </div>
        </div>
      </div>

      {/* STREAK & STATISTICAL PATTERN TAPE */}
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono-terminal">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Current Streak:</span>
          {streak.count > 0 ? (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                streak.type === 'BIG'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {streak.count}x {streak.type}
            </span>
          ) : (
            <span className="text-slate-500">None</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Pattern:</span>
          <span className="text-emerald-300 font-semibold">{analysis.recentPatternTrend}</span>
        </div>
      </div>

      {/* RECENT BIG/SMALL 15-ROUND SEQUENCE TRAIL */}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Recent 15-Round Result Sequence</span>
          <span className="text-[9px] text-slate-500 font-mono-terminal">Newest → Older</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto py-1 px-0.5 scrollbar-thin">
          {previousIssues.slice(0, 15).map((item, idx) => (
            <div
              key={`${item.issueNumber}-${idx}`}
              title={`Period: ${item.issueNumber} | Result: ${item.rawNumber} (${item.isBig ? 'BIG' : 'SMALL'})`}
              className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-black font-cyber border transition-transform ${
                idx === 0 ? 'ring-2 ring-emerald-400 scale-105' : ''
              } ${
                item.isBig
                  ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-900/60 border-rose-500/60 text-rose-300'
              }`}
            >
              {item.isBig ? 'B' : 'S'}
            </div>
          ))}
          {previousIssues.length === 0 && (
            <span className="text-xs text-slate-500 italic py-1">Waiting for issue stream...</span>
          )}
        </div>
      </div>

      {/* STATISTICAL TRANSITION HEURISTIC (TRANSPARENT, NOT FABRICATED PREDICTION) */}
      <div className="bg-black/70 border border-emerald-500/30 rounded-xl p-3 shadow-inner">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 font-cyber">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            AI PATTERN HEURISTIC (NEXT ROUND)
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Mathematical Model</span>
          </div>
        </div>

        {prediction.type !== 'WAITING' ? (
          <div className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span
                className={`text-base font-black font-cyber px-2 py-0.5 rounded ${
                  prediction.type === 'BIG'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}
              >
                PROBABLE: {prediction.type}
              </span>
              <span className="text-xs font-mono-terminal text-slate-300">
                Confidence: <strong className="text-emerald-400">{prediction.confidence}%</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 italic">Markov Chain</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic bg-black/40 rounded p-2 border border-slate-800 text-center">
            {isLoading ? 'Calibrating algorithm with live issues...' : 'WAITING FOR DATA (Collecting min. 15 issues)'}
          </div>
        )}

        <p className="mt-1.5 text-[10px] text-slate-400 leading-tight">
          {prediction.basis}
        </p>
      </div>
    </div>
  );
};
