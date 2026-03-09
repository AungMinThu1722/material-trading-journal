import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  InputAdornment,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTrades } from '../context/useTrades';
import { formatCurrency } from '../utils/calculations';

export default function Settings() {
  const { settings, updateSettings, trades } = useTrades();
  const [balance, setBalance] = useState(settings.initialBalance.toString());
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveBalance = () => {
    const val = Number(balance);
    if (!isNaN(val) && val >= 0) {
      updateSettings({ initialBalance: val });
      setSaved(true);
    }
  };

  const handleThemeToggle = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleClearData = () => {
    if (confirmClear) {
      localStorage.clear();
      window.location.reload();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                label="Starting Balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Your initial account balance for P&L calculations"
              />

              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveBalance}>
                Save Balance
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Balance: <strong>{formatCurrency(settings.initialBalance)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Trades: <strong>{trades.length}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Appearance
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={<Switch checked={settings.theme === 'dark'} onChange={handleThemeToggle} />}
                label={`${settings.theme === 'dark' ? 'Dark' : 'Light'} Mode`}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Toggle between dark and light themes.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom color="error">
                Danger Zone
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This will permanently delete all your trades and reset settings.
              </Typography>

              <Button
                variant={confirmClear ? 'contained' : 'outlined'}
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={handleClearData}
              >
                {confirmClear ? 'Click Again to Confirm' : 'Clear All Data'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSaved(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
