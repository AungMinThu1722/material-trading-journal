import { createContext } from 'react';
import type { Trade, AppSettings } from '../types/trade';

export interface TradeContextType {
  trades: Trade[];
  settings: AppSettings;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const TradeContext = createContext<TradeContextType | undefined>(undefined);
