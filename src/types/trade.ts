export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  entryDate: string;
  exitDate: string | null;
  strategy: string;
  notes: string;
  tags: string[];
  status: TradeStatus;
}

export interface TradeFormData {
  symbol: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  entryDate: string;
  exitDate: string;
  strategy: string;
  notes: string;
  tags: string;
  status: TradeStatus;
}

export interface AppSettings {
  initialBalance: number;
  theme: 'light' | 'dark';
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averagePnL: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  currentBalance: number;
}
