import type { Trade, TradeStats } from '../types/trade';

export function calculatePnL(trade: Trade): number {
  if (trade.exitPrice === null) return 0;
  const multiplier = trade.direction === 'long' ? 1 : -1;
  return (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
}

export function calculatePnLPercent(trade: Trade): number {
  if (trade.exitPrice === null) return 0;
  const multiplier = trade.direction === 'long' ? 1 : -1;
  return ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;
}

export function calculateStats(trades: Trade[], initialBalance: number): TradeStats {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.exitPrice !== null);
  const pnls = closedTrades.map(calculatePnL);
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const totalPnL = pnls.reduce((sum, p) => sum + p, 0);
  const grossWins = wins.reduce((sum, p) => sum + p, 0);
  const grossLosses = Math.abs(losses.reduce((sum, p) => sum + p, 0));

  return {
    totalTrades: closedTrades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0,
    totalPnL,
    averagePnL: closedTrades.length > 0 ? totalPnL / closedTrades.length : 0,
    averageWin: wins.length > 0 ? grossWins / wins.length : 0,
    averageLoss: losses.length > 0 ? grossLosses / losses.length : 0,
    bestTrade: pnls.length > 0 ? Math.max(...pnls) : 0,
    worstTrade: pnls.length > 0 ? Math.min(...pnls) : 0,
    profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0,
    currentBalance: initialBalance + totalPnL,
  };
}

export interface DailyPnL {
  date: string;
  pnl: number;
  cumulative: number;
}

export function getDailyPnL(trades: Trade[]): DailyPnL[] {
  const closedTrades = trades
    .filter((t) => t.status === 'closed' && t.exitDate !== null)
    .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());

  const dailyMap = new Map<string, number>();
  for (const trade of closedTrades) {
    const date = trade.exitDate!.split('T')[0];
    const pnl = calculatePnL(trade);
    dailyMap.set(date, (dailyMap.get(date) || 0) + pnl);
  }

  const result: DailyPnL[] = [];
  let cumulative = 0;
  for (const [date, pnl] of dailyMap) {
    cumulative += pnl;
    result.push({ date, pnl: Math.round(pnl * 100) / 100, cumulative: Math.round(cumulative * 100) / 100 });
  }
  return result;
}

export interface StrategyStats {
  strategy: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
}

export function getStrategyStats(trades: Trade[]): StrategyStats[] {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.exitPrice !== null);
  const strategyMap = new Map<string, Trade[]>();

  for (const trade of closedTrades) {
    const strategy = trade.strategy || 'Untagged';
    if (!strategyMap.has(strategy)) strategyMap.set(strategy, []);
    strategyMap.get(strategy)!.push(trade);
  }

  return Array.from(strategyMap.entries()).map(([strategy, stratTrades]) => {
    const pnls = stratTrades.map(calculatePnL);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);
    const totalPnL = pnls.reduce((sum, p) => sum + p, 0);

    return {
      strategy,
      trades: stratTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: stratTrades.length > 0 ? (wins.length / stratTrades.length) * 100 : 0,
      totalPnL: Math.round(totalPnL * 100) / 100,
      avgPnL: stratTrades.length > 0 ? Math.round((totalPnL / stratTrades.length) * 100) / 100 : 0,
    };
  });
}

export interface MonthlyPnL {
  month: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export function getMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.exitDate !== null);
  const monthlyMap = new Map<string, Trade[]>();

  for (const trade of closedTrades) {
    const date = new Date(trade.exitDate!);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap.has(month)) monthlyMap.set(month, []);
    monthlyMap.get(month)!.push(trade);
  }

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthTrades]) => {
      const pnls = monthTrades.map(calculatePnL);
      const wins = pnls.filter((p) => p > 0);
      const totalPnL = pnls.reduce((sum, p) => sum + p, 0);

      return {
        month,
        pnl: Math.round(totalPnL * 100) / 100,
        trades: monthTrades.length,
        winRate: monthTrades.length > 0 ? Math.round((wins.length / monthTrades.length) * 100) : 0,
      };
    });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
