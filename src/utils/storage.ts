import type { Trade, AppSettings } from '../types/trade';

const TRADES_KEY = 'trading_journal_trades';
const SETTINGS_KEY = 'trading_journal_settings';

const DEFAULT_SETTINGS: AppSettings = {
  initialBalance: 10000,
  theme: 'dark',
};

export function loadTrades(): Trade[] {
  try {
    const data = localStorage.getItem(TRADES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
