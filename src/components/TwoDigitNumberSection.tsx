import React, { useState } from 'react';
import { ParsedIssue } from '../types/wingo';
import { Hash, Copy, Check, Flame, Snowflake, Layers } from 'lucide-react';

interface TwoDigitNumberSectionProps {
  latestIssue: ParsedIssue | null;
  previousIssues: ParsedIssue[];
  hotNumbers: { number: number; count: number; percentage: number }[];
  coldNumbers: { number: number; count: number; percentage: number }[];
  isNewResultArrival: boolean;
}

export const TwoDigitNumberSection: React.FC<TwoDigitNumberSectionProps> = ({
  latestIssue,
  previousIssues,
  hotNumbers,
  coldNumbers,
  isNewResultArrival,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPeriod = () => {
    if (latestIssue?.issueNumber) {
      navigator.clipboard.writeText(latestIssue.issueNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNumberColorClass = (colors: string[]) => {
    if (colors.includes('green') && colors.includes('violet')) {
      return 'from-emerald-500 to-purple-600 text-white';
    }
    if (colors.includes('red') && colors.includes('violet')) {
      return 'from-rose-500 to-purple-600 text-white';
    }
    if (colors.includes('green')) {
      return 'bg-emerald-500 text-black';
    }
    if (colors.includes('red')) {
      return 'bg-rose-500 text-white';
    }
    return 'bg-slate-700 text-white';
  };

  const getColorLabel = (colors: string[]) => {
    if (colors.includes('green') && colors.includes('violet')) return 'Green + Violet';
    if (colors.includes('red') && colors.includes('violet')) return 'Red + Violet';
    if (colors.includes('green')) return 'Green';
    if (colors.includes('red')) return 'Red';
    return 'Standard';
  };

  return (
    <div className="space-y-3">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono-terminal">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-emerald-400 font-bold">
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          ACTUAL TWO-DIGIT RESULT
        </span>
        <button
          onClick={handleCopyPeriod}
          disabled={!latestIssue}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
          title="Copy Period ID"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Period'}</span>
        </button>
      </div>

      {/* MAIN TWO-DIGIT DISPLAY CARD */}
      <div
        className={`relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-b from-black/95 via-emerald-950/20 to-black/95 p-4 transition-all duration-500 ${
          isNewResultArrival ? 'ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-[1.02]' : ''
        }`}
      >
        {/* Subtle background glow circle */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* Left: Two-Digit Large Flip Box */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Digit 1 & Digit 2 Split Flap Box */}
              <div
                className={`flex items-center justify-center min-w-[96px] h-20 px-3 rounded-lg border-2 font-mono-terminal text-5xl font-black tracking-widest shadow-2xl transition-transform ${
                  isNewResultArrival ? 'animate-bounce' : ''
                } ${
                  latestIssue?.isBig
                    ? 'border-emerald-400/80 bg-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]'
                    : 'border-rose-400/80 bg-black text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                }`}
              >
                {latestIssue ? latestIssue.twoDigitFormatted : '--'}
              </div>

              {/* Verified API tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-emerald-500/60 text-[9px] font-mono-terminal font-bold text-emerald-300 px-2 py-0.2 rounded-full whitespace-nowrap shadow">
                VERIFIED API
              </div>
            </div>

            {/* Middle: Details */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Single Digit: <strong className="text-white text-sm font-mono-terminal">{latestIssue?.rawNumber ?? '-'}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Color:</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded shadow-sm ${
                    latestIssue
                      ? latestIssue.colors.includes('violet')
                        ? 'bg-gradient-to-r from-purple-700 to-emerald-700 text-white'
                        : latestIssue.colors.includes('green')
                        ? 'bg-emerald-600 text-black font-extrabold'
                        : 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {latestIssue ? getColorLabel(latestIssue.colors) : 'Pending'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Range: <strong className={latestIssue?.isBig ? 'text-emerald-400' : 'text-rose-400'}>
                  {latestIssue ? (latestIssue.isBig ? 'BIG (5-9)' : 'SMALL (0-4)') : '--'}
                </strong>
              </div>
            </div>
          </div>

          {/* Right: Round Period ID */}
          <div className="text-right pl-2 border-l border-emerald-950">
            <div className="text-[10px] text-slate-400 font-mono-terminal">Period Issue</div>
            <div className="text-xs font-bold text-emerald-300 font-mono-terminal tracking-wide">
              {latestIssue ? latestIssue.issueNumber : 'LOADING...'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono-terminal">
              Tail: <span className="text-white font-bold">{latestIssue?.shortIssue || '---'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT 10 NUMBERS MATRIX */}
      <div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            Recent Number Trail (Two-Digit Format)
          </span>
          <span className="text-[9px] text-slate-500 font-mono-terminal">Last 10 Draws</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {previousIssues.slice(0, 10).map((item, idx) => (
            <div
              key={`${item.issueNumber}-recent-${idx}`}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                idx === 0
                  ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-black/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[9px] text-slate-400 font-mono-terminal truncate">
                ...{item.shortIssue.slice(-3)}
              </div>
              <div
                className={`text-lg font-black font-mono-terminal my-0.5 ${
                  item.isBig ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.twoDigitFormatted}
              </div>
              <div className="flex items-center justify-center gap-0.5">
                {item.colors.map((c, cIdx) => (
                  <span
                    key={cIdx}
                    className={`w-2 h-2 rounded-full inline-block ${
                      c === 'green'
                        ? 'bg-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.8)]'
                        : c === 'red'
                        ? 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                        : 'bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.8)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
          {previousIssues.length === 0 && (
            <div className="col-span-5 text-center py-2 text-xs text-slate-500 italic">
              Awaiting live issue history...
            </div>
          )}
        </div>
      </div>

      {/* HOT & COLD NUMBERS METRICS */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono-terminal">
        {/* Hot Numbers */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            HOT DIGITS (100 Rounds)
          </div>
          <div className="flex items-center gap-1.5">
            {hotNumbers.map((h) => (
              <div
                key={h.number}
                className="flex-1 bg-black/60 border border-amber-500/30 rounded px-1.5 py-1 text-center"
              >
                <div className="text-sm font-bold text-amber-300">{h.number}</div>
                <div className="text-[9px] text-slate-400">{h.count}x ({h.percentage}%)</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-sky-950/20 border border-sky-500/20 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 mb-1">
            <Snowflake className="w-3.5 h-3.5 text-sky-400" />
            COLD DIGITS (100 Rounds)
          </div>
          <div className="flex items-center gap-1.5">
            {coldNumbers.map((c) => (
              <div
                key={c.number}
                className="flex-1 bg-black/60 border border-sky-500/30 rounded px-1.5 py-1 text-center"
              >
                <div className="text-sm font-bold text-sky-300">{c.number}</div>
                <div className="text-[9px] text-slate-400">{c.count}x ({c.percentage}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
