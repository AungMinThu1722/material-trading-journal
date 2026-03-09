import { Box, Card, CardContent, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useTrades } from '../context/useTrades';
import { calculateStats, getStrategyStats, getMonthlyPnL, formatCurrency } from '../utils/calculations';

export default function Analytics() {
  const { trades, settings } = useTrades();
  const stats = calculateStats(trades, settings.initialBalance);
  const strategyStats = getStrategyStats(trades);
  const monthlyPnL = getMonthlyPnL(trades);

  const winLossData = [
    { name: 'Wins', value: stats.winningTrades, color: '#4caf50' },
    { name: 'Losses', value: stats.losingTrades, color: '#f44336' },
  ].filter((d) => d.value > 0);

  const hasData = trades.filter((t) => t.status === 'closed').length > 0;

  if (!hasData) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics
        </Typography>
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No closed trades to analyze yet.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Close some trades to see your analytics here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Analytics
      </Typography>

      {/* Key Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Best Trade</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(stats.bestTrade)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Worst Trade</Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">
                {formatCurrency(stats.worstTrade)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Avg Win</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(stats.averageWin)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Avg Loss</Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">
                {formatCurrency(stats.averageLoss)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Win/Loss Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Win / Loss Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly P&L Bar Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Monthly Performance
              </Typography>
              {monthlyPnL.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyPnL}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'P&L']} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {monthlyPnL.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#4caf50' : '#f44336'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No monthly data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Win Rate Line Chart */}
      {monthlyPnL.length > 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Monthly Win Rate Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPnL}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(value) => [`${Number(value)}%`, 'Win Rate']} />
                <Line type="monotone" dataKey="winRate" stroke="#2196f3" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Strategy Breakdown Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Strategy Performance
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Strategy</TableCell>
                  <TableCell align="center">Trades</TableCell>
                  <TableCell align="center">W / L</TableCell>
                  <TableCell align="center">Win Rate</TableCell>
                  <TableCell align="right">Total P&L</TableCell>
                  <TableCell align="right">Avg P&L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {strategyStats.map((s) => (
                  <TableRow key={s.strategy} hover>
                    <TableCell>
                      <Chip label={s.strategy} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell align="center">{s.trades}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        <Typography component="span" color="success.main" fontWeight={600}>{s.wins}</Typography>
                        {' / '}
                        <Typography component="span" color="error.main" fontWeight={600}>{s.losses}</Typography>
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${s.winRate.toFixed(0)}%`}
                        size="small"
                        color={s.winRate >= 50 ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color={s.totalPnL >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(s.totalPnL)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color={s.avgPnL >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(s.avgPnL)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {strategyStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No strategy data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
