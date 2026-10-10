export type GameType = 'WINGO_30S' | 'WINGO_1M' | 'WINGO_3M' | 'WINGO_5M';

export interface GameConfig {
  id: GameType;
  name: string;
  durationSeconds: number;
  apiPath: string;
  description: string;
}

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  WINGO_1M: {
    id: 'WINGO_1M',
    name: 'Win Go 1Min',
    durationSeconds: 60,
    apiPath: 'WinGo/WinGo_1M/GetHistoryIssuePage.json',
    description: 'Fast 1-minute lottery round with real-time draw.',
  },
  WINGO_30S: {
    id: 'WINGO_30S',
    name: 'Win Go 30s',
    durationSeconds: 30,
    apiPath: 'WinGo/WinGo_30S/GetHistoryIssuePage.json',
    description: 'Ultra rapid 30-second draw frequency.',
  },
  WINGO_3M: {
    id: 'WINGO_3M',
    name: 'Win Go 3Min',
    durationSeconds: 180,
    apiPath: 'WinGo/WinGo_3M/GetHistoryIssuePage.json',
    description: '3-minute strategic interval round.',
  },
  WINGO_5M: {
    id: 'WINGO_5M',
    name: 'Win Go 5Min',
    durationSeconds: 300,
    apiPath: 'WinGo/WinGo_5M/GetHistoryIssuePage.json',
    description: '5-minute extended pattern analysis cycle.',
  },
};

export interface RawIssueItem {
  issueNumber: string;
  number: string;
  color: string;
  premium?: string;
  sum?: number;
}

export interface WingoApiResponse {
  data?: {
    list: RawIssueItem[];
    pageNo: number;
    totalPage: number;
    totalCount: number;
  };
  code: number;
  msg: string;
  msgCode: number;
  serviceTime?: number;
}

export interface ParsedIssue {
  issueNumber: string;
  shortIssue: string;
  rawNumber: number;
  twoDigitFormatted: string;
  color: 'green' | 'red' | 'green,violet' | 'red,violet' | 'unknown';
  isBig: boolean; // 5,6,7,8,9
  isSmall: boolean; // 0,1,2,3,4
  colors: Array<'green' | 'red' | 'violet'>;
  timestamp?: number;
}

export interface StatisticalAnalysis {
  sampleSize: number;
  bigCount: number;
  smallCount: number;
  bigPercentage: number;
  smallPercentage: number;
  currentStreak: {
    type: 'BIG' | 'SMALL' | 'NONE';
    count: number;
  };
  colorDistribution: {
    green: number;
    red: number;
    violet: number;
  };
  hotNumbers: { number: number; count: number; percentage: number }[];
  coldNumbers: { number: number; count: number; percentage: number }[];
  recentPatternTrend: 'ALTERNATING' | 'BIG_DOMINANT' | 'SMALL_DOMINANT' | 'BALANCED';
  statisticalNextPrediction: {
    type: 'BIG' | 'SMALL' | 'WAITING';
    confidence: number;
    basis: string;
  };
}
