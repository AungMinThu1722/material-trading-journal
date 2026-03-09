import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTrades } from '../context/useTrades';
import type { Trade, TradeDirection, TradeStatus, TradeFormData } from '../types/trade';

const STRATEGIES = [
  'Breakout',
  'Trend Following',
  'Mean Reversion',
  'Scalping',
  'Swing Trade',
  'Momentum',
  'Support/Resistance',
  'VWAP',
  'Other',
];

const defaultFormData: TradeFormData = {
  symbol: '',
  direction: 'long',
  entryPrice: '',
  exitPrice: '',
  quantity: '',
  entryDate: new Date().toISOString().split('T')[0],
  exitDate: '',
  strategy: '',
  notes: '',
  tags: '',
  status: 'closed',
};

export default function TradeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trades, addTrade, updateTrade } = useTrades();
  const isEditing = Boolean(id);

  const initialFormData = useMemo<TradeFormData>(() => {
    if (id) {
      const trade = trades.find((t) => t.id === id);
      if (trade) {
        return {
          symbol: trade.symbol,
          direction: trade.direction,
          entryPrice: trade.entryPrice.toString(),
          exitPrice: trade.exitPrice?.toString() || '',
          quantity: trade.quantity.toString(),
          entryDate: trade.entryDate.split('T')[0],
          exitDate: trade.exitDate?.split('T')[0] || '',
          strategy: trade.strategy,
          notes: trade.notes,
          tags: trade.tags.join(', '),
          status: trade.status,
        };
      }
    }
    return defaultFormData;
  }, [id, trades]);

  const [formData, setFormData] = useState<TradeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof TradeFormData, string>>>({});

  const handleChange = (field: keyof TradeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TradeFormData, string>> = {};

    if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!formData.entryPrice || isNaN(Number(formData.entryPrice)) || Number(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Valid entry price is required';
    }
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.entryDate) newErrors.entryDate = 'Entry date is required';

    if (formData.status === 'closed') {
      if (!formData.exitPrice || isNaN(Number(formData.exitPrice)) || Number(formData.exitPrice) <= 0) {
        newErrors.exitPrice = 'Valid exit price is required for closed trades';
      }
      if (!formData.exitDate) newErrors.exitDate = 'Exit date is required for closed trades';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const trade: Omit<Trade, 'id'> = {
      symbol: formData.symbol.toUpperCase().trim(),
      direction: formData.direction as TradeDirection,
      entryPrice: Number(formData.entryPrice),
      exitPrice: formData.exitPrice ? Number(formData.exitPrice) : null,
      quantity: Number(formData.quantity),
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || null,
      strategy: formData.strategy,
      notes: formData.notes,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: formData.status as TradeStatus,
    };

    if (isEditing && id) {
      updateTrade(id, trade);
    } else {
      addTrade(trade);
    }
    navigate('/trades');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEditing ? 'Edit Trade' : 'Add New Trade'}
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value)}
                error={!!errors.symbol}
                helperText={errors.symbol}
                placeholder="e.g. AAPL, BTC/USD"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Direction</InputLabel>
                <Select
                  value={formData.direction}
                  label="Direction"
                  onChange={(e) => handleChange('direction', e.target.value)}
                >
                  <MenuItem value="long">
                    <Chip label="LONG" color="success" size="small" sx={{ mr: 1 }} /> Long
                  </MenuItem>
                  <MenuItem value="short">
                    <Chip label="SHORT" color="error" size="small" sx={{ mr: 1 }} /> Short
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Entry Price"
                type="number"
                value={formData.entryPrice}
                onChange={(e) => handleChange('entryPrice', e.target.value)}
                error={!!errors.entryPrice}
                helperText={errors.entryPrice}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Exit Price"
                type="number"
                value={formData.exitPrice}
                onChange={(e) => handleChange('exitPrice', e.target.value)}
                error={!!errors.exitPrice}
                helperText={errors.exitPrice}
                disabled={formData.status === 'open'}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Strategy"
                value={formData.strategy}
                onChange={(e) => handleChange('strategy', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {STRATEGIES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Entry Date"
                type="date"
                value={formData.entryDate}
                onChange={(e) => handleChange('entryDate', e.target.value)}
                error={!!errors.entryDate}
                helperText={errors.entryDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Exit Date"
                type="date"
                value={formData.exitDate}
                onChange={(e) => handleChange('exitDate', e.target.value)}
                error={!!errors.exitDate}
                helperText={errors.exitDate}
                disabled={formData.status === 'open'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="Comma-separated tags, e.g. earnings, gap-up"
                helperText="Separate tags with commas"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="What was your reasoning? Lessons learned?"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit} size="large">
                  {isEditing ? 'Update Trade' : 'Save Trade'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
