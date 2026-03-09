import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PercentIcon from '@mui/icons-material/Percent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTrades } from '../context/useTrades';
import { calculateStats, getDailyPnL, calculatePnL, formatCurrency } from '../utils/calculations';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}22`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { trades, settings } = useTrades();
  const navigate = useNavigate();
  const stats = calculateStats(trades, settings.initialBalance);
  const dailyPnL = getDailyPnL(trades);
  const recentTrades = trades
    .filter((t) => t.status === 'closed')
    .sort((a, b) => new Date(b.exitDate || b.entryDate).getTime() - new Date(a.exitDate || a.entryDate).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/trades/new')}>
          New Trade
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total P&L"
            value={formatCurrency(stats.totalPnL)}
            icon={<ShowChartIcon sx={{ color: stats.totalPnL >= 0 ? '#4caf50' : '#f44336' }} />}
            color={stats.totalPnL >= 0 ? '#4caf50' : '#f44336'}
            subtitle={`Balance: ${formatCurrency(stats.currentBalance)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon={<PercentIcon sx={{ color: '#2196f3' }} />}
            color="#2196f3"
            subtitle={`${stats.winningTrades}W / ${stats.losingTrades}L`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Trades"
            value={stats.totalTrades.toString()}
            icon={<AccountBalanceWalletIcon sx={{ color: '#9c27b0' }} />}
            color="#9c27b0"
            subtitle={`${trades.filter((t) => t.status === 'open').length} open`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor === Infinity ? '---' : stats.profitFactor.toFixed(2)}
            icon={
              stats.profitFactor >= 1 ? (
                <TrendingUpIcon sx={{ color: '#4caf50' }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#f44336' }} />
              )
            }
            color={stats.profitFactor >= 1 ? '#4caf50' : '#f44336'}
            subtitle={`Avg Win: ${formatCurrency(stats.averageWin)}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Equity Curve
              </Typography>
              {dailyPnL.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyPnL}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), 'Cumulative P&L']}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#2196f3"
                      fillOpacity={1}
                      fill="url(#colorPnl)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No closed trades yet. Add your first trade!</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Trades
                </Typography>
                <Button size="small" onClick={() => navigate('/trades')}>
                  View All
                </Button>
              </Box>
              {recentTrades.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Dir</TableCell>
                        <TableCell align="right">P&L</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTrades.map((trade) => {
                        const pnl = calculatePnL(trade);
                        return (
                          <TableRow key={trade.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/trades/${trade.id}/edit`)}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {trade.symbol}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={trade.direction.toUpperCase()}
                                size="small"
                                color={trade.direction === 'long' ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={pnl >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatCurrency(pnl)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No trades yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
