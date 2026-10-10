import React, { useState, useMemo } from 'react';
import { ParsedIssue } from '../types/wingo';
import { Search, Download, Filter, RefreshCw, AlertCircle } from 'lucide-react';

interface SignalHistoryTableProps {
  issues: ParsedIssue[];
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
  networkError: string | null;
}

export const SignalHistoryTable: React.FC<SignalHistoryTableProps> = ({
  issues,
  isLoading,
  onRefresh,
  lastUpdated,
  networkError,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BIG' | 'SMALL' | 'GREEN' | 'RED' | 'VIOLET'>('ALL');

  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      // Search filter
      if (search.trim() && !item.issueNumber.includes(search.trim())) {
        return false;
      }
      // Type filter
      if (filterType === 'BIG' && !item.isBig) return false;
      if (filterType === 'SMALL' && !item.isSmall) return false;
      if (filterType === 'GREEN' && !item.colors.includes('green')) return false;
      if (filterType === 'RED' && !item.colors.includes('red')) return false;
      if (filterType === 'VIOLET' && !item.colors.includes('violet')) return false;
      return true;
    });
  }, [issues, search, filterType]);

  const handleExportCSV = () => {
    if (issues.length === 0) return;
    const headers = ['IssueNumber', 'ResultNumber', 'TwoDigit', 'BigSmall', 'Color'];
    const rows = issues.map((i) => [
      i.issueNumber,
      i.rawNumber,
      i.twoDigitFormatted,
      i.isBig ? 'BIG' : 'SMALL',
      i.colors.join('+'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nova_signal_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Issue ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/70 border border-emerald-950 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none font-mono-terminal transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={issues.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black border border-emerald-500/30 hover:border-emerald-400 text-slate-300 text-xs font-mono-terminal transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono-terminal">
        {(['ALL', 'BIG', 'SMALL', 'GREEN', 'RED', 'VIOLET'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              filterType === tab
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ERROR NOTICE IF ANY */}
      {networkError && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div className="truncate">
            <span className="font-semibold">API Disconnected:</span> {networkError}
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="rounded-xl border border-emerald-950 bg-black/80 overflow-hidden shadow-xl max-h-[340px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono-terminal">
          <thead className="sticky top-0 bg-emerald-950/90 text-slate-400 border-b border-emerald-900/50 backdrop-blur z-10">
            <tr>
              <th className="py-2 px-3 text-[10px] uppercase tracking-wider">Period</th>
              <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-center">Number</th>
              <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-center">Size</th>
              <th className="py-2 px-3 text-[10px] uppercase tracking-wider text-right">Color</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950/50">
            {filteredIssues.map((item, idx) => (
              <tr
                key={item.issueNumber}
                className={`transition-colors hover:bg-emerald-950/30 ${
                  idx === 0 ? 'bg-emerald-950/20 font-semibold' : ''
                }`}
              >
                {/* Period */}
                <td className="py-2 px-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    <span>{item.issueNumber}</span>
                  </div>
                </td>

                {/* Number */}
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-block min-w-[28px] py-0.5 px-1.5 rounded font-black text-sm ${
                      item.isBig ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.twoDigitFormatted}
                  </span>
                </td>

                {/* Size */}
                <td className="py-2 px-2 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.isBig
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.isBig ? 'BIG' : 'SMALL'}
                  </span>
                </td>

                {/* Color */}
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.colors.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          c === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : c === 'red'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}

            {filteredIssues.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                  {isLoading ? 'Streaming live issue results...' : 'No historical issues found matching query.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-terminal px-1">
        <span>Displaying {filteredIssues.length} of {issues.length} loaded records</span>
        {lastUpdated && (
          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};
