import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { TradeProvider } from './context/TradeContext';
import { useTrades } from './context/useTrades';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TradeHistory from './pages/TradeHistory';
import TradeForm from './pages/TradeForm';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function ThemedApp() {
  const { settings } = useTrades();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: settings.theme,
          primary: {
            main: '#2196f3',
          },
          secondary: {
            main: '#ff9800',
          },
          ...(settings.theme === 'dark'
            ? {
                background: {
                  default: '#0a1929',
                  paper: '#132f4c',
                },
              }
            : {}),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [settings.theme]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="trades" element={<TradeHistory />} />
            <Route path="trades/new" element={<TradeForm />} />
            <Route path="trades/:id/edit" element={<TradeForm />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <TradeProvider>
      <ThemedApp />
    </TradeProvider>
  );
}

export default App;
