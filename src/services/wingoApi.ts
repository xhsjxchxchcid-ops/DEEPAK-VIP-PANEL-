import {
  GameType,
  GAME_CONFIGS,
  WingoApiResponse,
  ParsedIssue,
  StatisticalAnalysis,
} from '../types/wingo';

const API_BASE_DIRECT = 'https://draw.ar-lottery01.com';
const API_BASE_PROXY = '/proxy-api';

/**
 * Parses raw API items into strictly typed ParsedIssue objects.
 * Never guesses or fabricates missing digits or results.
 */
export function parseIssueItem(item: {
  issueNumber: string;
  number: string;
  color: string;
}): ParsedIssue | null {
  if (!item || typeof item.issueNumber !== 'string' || typeof item.number !== 'string') {
    return null;
  }

  const num = parseInt(item.number.trim(), 10);
  if (isNaN(num) || num < 0 || num > 9) {
    return null;
  }

  const rawColor = (item.color || '').toLowerCase().trim();
  const colorList: Array<'green' | 'red' | 'violet'> = [];
  if (rawColor.includes('green')) colorList.push('green');
  if (rawColor.includes('red')) colorList.push('red');
  if (rawColor.includes('violet')) colorList.push('violet');

  // WinGo standard colors fallback if API omitted:
  // 0: Red + Violet, 5: Green + Violet
  // 1,3,7,9: Green
  // 2,4,6,8: Red
  if (colorList.length === 0) {
    if (num === 0) colorList.push('red', 'violet');
    else if (num === 5) colorList.push('green', 'violet');
    else if (num % 2 === 1) colorList.push('green');
    else colorList.push('red');
  }

  return {
    issueNumber: item.issueNumber.trim(),
    shortIssue: item.issueNumber.trim().slice(-5),
    rawNumber: num,
    twoDigitFormatted: String(num).padStart(2, '0'),
    color: rawColor as ParsedIssue['color'],
    isBig: num >= 5,
    isSmall: num <= 4,
    colors: colorList,
  };
}

/**
 * Fetches real-time draw history from the official API.
 * Uses direct CORS endpoint first, falling back to Vite proxy if blocked.
 */
export async function fetchWingoHistory(
  gameType: GameType = 'WINGO_1M',
  pageSize: number = 100
): Promise<{ issues: ParsedIssue[]; rawResponse: WingoApiResponse; source: 'direct' | 'proxy' }> {
  const config = GAME_CONFIGS[gameType];
  const timestamp = Date.now();
  const query = `pageNo=1&pageSize=${pageSize}&ts=${timestamp}`;

  const directUrl = `${API_BASE_DIRECT}/${config.apiPath}?${query}`;
  const proxyUrl = `${API_BASE_PROXY}/${config.apiPath}?${query}`;

  let response: Response | null = null;
  let source: 'direct' | 'proxy' = 'direct';

  try {
    // Attempt direct fetch (Alibaba Cloud OSS has Access-Control-Allow-Origin: *)
    response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Direct fetch returned HTTP ${response.status}`);
    }
  } catch (_err) {
    // If direct fetch fails or returns non-200, fallback to Vite proxy
    try {
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
        cache: 'no-store',
      });
      source = 'proxy';
    } catch (proxyErr) {
      throw new Error(`Network failure connecting to WinGo draw server: ${(proxyErr as Error).message}`);
    }
  }

  if (!response || !response.ok) {
    throw new Error(`API returned HTTP status ${response?.status || 'Unknown'}`);
  }

  const json: WingoApiResponse = await response.json();

  if (json.code !== 0 && json.msgCode !== 0) {
    throw new Error(`API returned error code ${json.code}: ${json.msg || 'Unknown error'}`);
  }

  const rawList = json.data?.list || [];
  const parsed: ParsedIssue[] = [];

  for (const item of rawList) {
    const valid = parseIssueItem(item);
    if (valid) {
      parsed.push(valid);
    }
  }

  return {
    issues: parsed,
    rawResponse: json,
    source,
  };
}

/**
 * Computes transparent statistical pattern analysis based purely on actual historical draws.
 */
export function computeStatisticalAnalysis(issues: ParsedIssue[]): StatisticalAnalysis {
  if (!issues || issues.length === 0) {
    return {
      sampleSize: 0,
      bigCount: 0,
      smallCount: 0,
      bigPercentage: 0,
      smallPercentage: 0,
      currentStreak: { type: 'NONE', count: 0 },
      colorDistribution: { green: 0, red: 0, violet: 0 },
      hotNumbers: [],
      coldNumbers: [],
      recentPatternTrend: 'BALANCED',
      statisticalNextPrediction: {
        type: 'WAITING',
        confidence: 0,
        basis: 'Insufficient data points to calculate mathematical distribution.',
      },
    };
  }

  const sampleSize = issues.length;
  let bigCount = 0;
  let smallCount = 0;
  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;

  const numberFrequency: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) {
    numberFrequency[i] = 0;
  }

  // Calculate current streak from newest to older
  const firstIssue = issues[0];
  const streakType: 'BIG' | 'SMALL' = firstIssue.isBig ? 'BIG' : 'SMALL';
  let streakCount = 0;

  for (let i = 0; i < issues.length; i++) {
    const item = issues[i];
    if (i === streakCount && ((streakType === 'BIG' && item.isBig) || (streakType === 'SMALL' && item.isSmall))) {
      streakCount++;
    }

    if (item.isBig) bigCount++;
    if (item.isSmall) smallCount++;

    if (item.colors.includes('green')) greenCount++;
    if (item.colors.includes('red')) redCount++;
    if (item.colors.includes('violet')) violetCount++;

    numberFrequency[item.rawNumber] = (numberFrequency[item.rawNumber] || 0) + 1;
  }

  const bigPercentage = Math.round((bigCount / sampleSize) * 100);
  const smallPercentage = Math.round((smallCount / sampleSize) * 100);

  // Hot & Cold numbers
  const sortedNumbers = Object.entries(numberFrequency)
    .map(([num, count]) => ({
      number: parseInt(num, 10),
      count,
      percentage: Math.round((count / sampleSize) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const hotNumbers = sortedNumbers.slice(0, 3);
  const coldNumbers = sortedNumbers.slice(-3).reverse();

  // Pattern trend heuristics (e.g. Dragon streak, zig-zag)
  let alternatingMatches = 0;
  const recentWindow = Math.min(10, issues.length);
  for (let i = 0; i < recentWindow - 1; i++) {
    if (issues[i].isBig !== issues[i + 1].isBig) {
      alternatingMatches++;
    }
  }

  let recentTrend: StatisticalAnalysis['recentPatternTrend'] = 'BALANCED';
  if (streakCount >= 4) {
    recentTrend = streakType === 'BIG' ? 'BIG_DOMINANT' : 'SMALL_DOMINANT';
  } else if (alternatingMatches >= 6) {
    recentTrend = 'ALTERNATING';
  } else if (bigPercentage >= 58) {
    recentTrend = 'BIG_DOMINANT';
  } else if (smallPercentage >= 58) {
    recentTrend = 'SMALL_DOMINANT';
  }

  // Markov Transition estimation based on current state
  // Notice: Clearly explained as statistical pattern, never fabricated certainty.
  let predictionType: 'BIG' | 'SMALL' | 'WAITING' = 'WAITING';
  let confidence = 50;
  let basis = 'Waiting for sufficient historical rounds.';

  if (sampleSize >= 15) {
    const lastState = firstIssue.isBig ? 'BIG' : 'SMALL';
    let transitionsToBig = 0;
    let transitionsToSmall = 0;

    for (let i = 0; i < issues.length - 1; i++) {
      const current = issues[i + 1].isBig ? 'BIG' : 'SMALL';
      const next = issues[i].isBig ? 'BIG' : 'SMALL';

      if (current === lastState) {
        if (next === 'BIG') transitionsToBig++;
        else transitionsToSmall++;
      }
    }

    const totalTransitions = transitionsToBig + transitionsToSmall;
    if (totalTransitions > 5) {
      const probBig = Math.round((transitionsToBig / totalTransitions) * 100);
      const probSmall = 100 - probBig;

      if (probBig > 55) {
        predictionType = 'BIG';
        confidence = probBig;
        basis = `Markov transition model: Following ${lastState}, BIG occurred ${transitionsToBig}/${totalTransitions} times (${probBig}%).`;
      } else if (probSmall > 55) {
        predictionType = 'SMALL';
        confidence = probSmall;
        basis = `Markov transition model: Following ${lastState}, SMALL occurred ${transitionsToSmall}/${totalTransitions} times (${probSmall}%).`;
      } else {
        predictionType = firstIssue.isBig ? 'SMALL' : 'BIG';
        confidence = 52;
        basis = `Mean-reversion model: Even transition frequency (${probBig}% vs ${probSmall}%); tracking alternate cycle.`;
      }
    } else {
      predictionType = 'WAITING';
      basis = 'Insufficient conditional transition frequency.';
    }
  }

  return {
    sampleSize,
    bigCount,
    smallCount,
    bigPercentage,
    smallPercentage,
    currentStreak: {
      type: streakType,
      count: streakCount,
    },
    colorDistribution: {
      green: greenCount,
      red: redCount,
      violet: violetCount,
    },
    hotNumbers,
    coldNumbers,
    recentPatternTrend: recentTrend,
    statisticalNextPrediction: {
      type: predictionType,
      confidence,
      basis,
    },
  };
}
