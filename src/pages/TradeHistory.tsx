import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableSortLabel,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useTrades } from '../context/useTrades';
import { calculatePnL, calculatePnLPercent, formatCurrency, formatPercent } from '../utils/calculations';
import type { Trade } from '../types/trade';

type SortField = 'symbol' | 'direction' | 'entryDate' | 'pnl' | 'status';
type SortDir = 'asc' | 'desc';

export default function TradeHistory() {
  const { trades, deleteTrade } = useTrades();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('entryDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredTrades = useMemo(() => {
    let result = [...trades];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.symbol.toLowerCase().includes(s) ||
          t.strategy.toLowerCase().includes(s) ||
          t.tags.some((tag) => tag.toLowerCase().includes(s))
      );
    }

    if (directionFilter !== 'all') {
      result = result.filter((t) => t.direction === directionFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'symbol':
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case 'direction':
          cmp = a.direction.localeCompare(b.direction);
          break;
        case 'entryDate':
          cmp = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
          break;
        case 'pnl':
          cmp = calculatePnL(a) - calculatePnL(b);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [trades, search, directionFilter, statusFilter, sortField, sortDir]);

  const handleDelete = (id: string) => {
    deleteTrade(id);
    setDeleteDialog(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Trade History
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/trades/new')}>
          New Trade
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search symbol, strategy, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              select
              label="Direction"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="long">Long</MenuItem>
              <MenuItem value="short">Short</MenuItem>
            </TextField>
            <TextField
              size="small"
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel active={sortField === 'symbol'} direction={sortDir} onClick={() => handleSort('symbol')}>
                  Symbol
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'direction'} direction={sortDir} onClick={() => handleSort('direction')}>
                  Direction
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Entry</TableCell>
              <TableCell align="right">Exit</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'entryDate'} direction={sortDir} onClick={() => handleSort('entryDate')}>
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'pnl'} direction={sortDir} onClick={() => handleSort('pnl')}>
                  P&L
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={sortField === 'status'} direction={sortDir} onClick={() => handleSort('status')}>
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {trades.length === 0 ? 'No trades yet. Add your first trade!' : 'No trades match your filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTrades.map((trade: Trade) => {
                const pnl = calculatePnL(trade);
                const pnlPercent = calculatePnLPercent(trade);
                return (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{trade.symbol}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trade.direction.toUpperCase()}
                        size="small"
                        color={trade.direction === 'long' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(trade.entryPrice)}</TableCell>
                    <TableCell align="right">
                      {trade.exitPrice !== null ? formatCurrency(trade.exitPrice) : '---'}
                    </TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell>{trade.entryDate}</TableCell>
                    <TableCell>
                      {trade.strategy && <Chip label={trade.strategy} size="small" variant="outlined" />}
                    </TableCell>
                    <TableCell>
                      {trade.status === 'closed' ? (
                        <Box>
                          <Typography fontWeight={600} color={pnl >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(pnl)}
                          </Typography>
                          <Typography variant="caption" color={pnlPercent >= 0 ? 'success.main' : 'error.main'}>
                            {formatPercent(pnlPercent)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography color="text.secondary">Open</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trade.status.toUpperCase()}
                        size="small"
                        color={trade.status === 'open' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => navigate(`/trades/${trade.id}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog(trade.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog !== null} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Trade</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this trade? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
