import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const textStyle = {
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize],
    color: theme.palette.text.primary
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/register', {
        email: `${email}@studentmail.com`, 
        password, 
        role
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <Typography variant="h4" gutterBottom sx={textStyle}>
          Register
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3, ...textStyle }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            value={email}
            name="email"  // Important for autofill
            autoComplete="username"  // Triggers browser autofill
            onChange={(e) => {
              const input = e.target.value;
              if (input.endsWith('@studentmail.com')) {
                setEmail(input.replace('@studentmail.com', ''));
              } else {
                setEmail(input);
              }
            }}
            InputProps={{
              endAdornment: (
                <Typography sx={{ color: theme.palette.text.secondary, ml: 1 }}>
                  @studentmail.com
                </Typography>
              ),
              style: {
                ...textStyle,
                backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                color: theme.palette.text.primary
              }
            }}
            required
            sx={textFieldStyle}
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
            name="password"  // Important for autofill
            autoComplete="new-password"  // Triggers browser password save
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
          <FormControl fullWidth margin="normal" sx={textFieldStyle}>
            <InputLabel id="role-label" sx={textStyle}>Role</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
              required
              sx={{
                ...textStyle,
                '& .MuiSelect-select': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fff',
                    '& .MuiMenuItem-root': {
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fff',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="student" sx={textStyle}>Student</MenuItem>
              <MenuItem value="lecturer" sx={textStyle}>Lecturer</MenuItem>
            </Select>
          </FormControl>
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
              height: '48px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a0dbb, #1f67e0)',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'
              },
            }}
          >
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
}