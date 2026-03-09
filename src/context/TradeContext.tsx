import React, { useState, useCallback, useEffect } from 'react';
import type { Trade, AppSettings } from '../types/trade';
import { TradeContext } from './TradeContextDef';
import { loadTrades, saveTrades, loadSettings, saveSettings } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const addTrade = useCallback((trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = { ...trade, id: uuidv4() };
    setTrades((prev) => [newTrade, ...prev]);
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <TradeContext.Provider value={{ trades, settings, addTrade, updateTrade, deleteTrade, updateSettings }}>
      {children}
    </TradeContext.Provider>
  );
}
