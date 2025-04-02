import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  TextField,
  Grid
} from '@mui/material';
import { useTheme } from '../contexts/ThemeContext'; // import your custom theme context

export default function TwoFALoginPage() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setError('');
    const token = digits.join('');
    if (token.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    const res = await fetch('/api/2fa/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid token');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          padding: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 4px 20px rgba(0, 0, 0, 0.5)'
            : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Enter 2FA Code
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          {digits.map((digit, index) => (
            <Grid item key={index}>
              <TextField
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    width: '3rem',
                    height: '3rem',
                    padding: 0,
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                    color: theme.palette.text.primary,
                  }
                }}
                variant="outlined"
              />
            </Grid>
          ))}
        </Grid>

        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)',
            },
          }}
        >
          Verify
        </Button>
      </Box>
    </Container>
  );
}
