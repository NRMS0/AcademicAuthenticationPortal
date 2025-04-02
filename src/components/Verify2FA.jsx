import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Grid } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

export default function Verify2FA() {
  //Managing the 6 individual digits of the 2FA code
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  //State for error messages
  const [error, setError] = useState('');
  //hook for navigation
  const navigate = useNavigate();
  //Theme hook to get the currently chosen theme
  const theme = useTheme();
  //Ref to store input elements to manage focus
  const inputRefs = useRef([]);

  //Handles the change in each digit input
  const handleChange = (index, value) => {
    //ensure only 1-9 
    if (/^\d?$/.test(value)) {
      const updated = [...digits];
      updated[index] = value;
      setDigits(updated);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  //Handles the backspace key to move backwards on input field
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  //Handles submission of the 2FA code
  const handleSubmit = async () => {
    const token = digits.join('');
    //validate length
    if (token.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    try {
      //Send request to the backend
      const res = await api.post('/2fa/login/verify', { token }, { withCredentials: true });
      const { token: jwtToken, role } = res.data;

      //Store token in local storage
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('role', role);

      //Navigate user to their dashboard based on their role
      navigate(role === 'lecturer' ? '/lecturer-dashboard' : '/student-dashboard');
    } catch (err) {
      console.error('2FA verification failed:', err);
      setError(err.response?.data?.message || 'Verification failed. Try again.');
    }
  };

  //page layout
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          padding: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0px 4px 20px rgba(0, 0, 0, 0.5)'
              : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Verify 2FA
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            color: theme.palette.mode === 'dark' ? '#bbb' : theme.palette.text.secondary
          }}
        >
          Enter the 6-digit code from your authenticator app
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
                    padding: '0.75rem',
                    width: '3rem',
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                    color: theme.palette.text.primary
                  },
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
            mt: 2,
            mb: 1,
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
