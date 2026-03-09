import { useContext } from 'react';
import { TradeContext } from './TradeContextDef';

export function useTrades() {
  const context = useContext(TradeContext);
  if (!context) throw new Error('useTrades must be used within a TradeProvider');
  return context;
}
