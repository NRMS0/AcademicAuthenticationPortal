import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

    //text styling based on theme context
  const textStyle = {
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize],
    color: theme.palette.text.primary
  };

  //styling for text fields based on theme
  const textFieldStyle = {
    ...textStyle,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
      },
      '&:hover fieldset': {
        borderColor: theme.palette.mode === 'dark' ? '#888' : '#aaa',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
    },
  };


  //handles submission 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log("Sending login request with:", { email, password });

      const response = await api.post(
        '/auth/login',
        { email, password },
        { withCredentials: true }
      );
      // Handle 2FA case
      if (response.data.twoFactorRequired) {
        localStorage.setItem('tempUserId', response.data.tempUserId);
        navigate('/verify-2fa');
        return;
      }

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);


      // Redirect based on user role
      if (role === 'lecturer') {
        navigate('/lecturer-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={textStyle}
        >
          Login
        </Typography>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={textFieldStyle}
            InputProps={{
              style: {
                ...textStyle,
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                color: theme.palette.text.primary
              }
            }}
            InputLabelProps={{
              style: {
                ...textStyle,
                color: theme.palette.text.secondary
              }
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={textFieldStyle}
            InputProps={{
              style: {
                ...textStyle,
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                color: theme.palette.text.primary
              }
            }}
            InputLabelProps={{
              style: {
                ...textStyle,
                color: theme.palette.text.secondary
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 3, 
              mb: 2,
              ...textStyle,
              background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)',
              }
            }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}