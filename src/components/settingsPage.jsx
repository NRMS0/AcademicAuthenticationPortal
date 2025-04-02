import { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, TextField, CircularProgress, Link } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import api from '@/services/api';

export default function SettingsPage() {
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  // handle password change
  const handleChangePassword = async () => {
    //check if passwords match
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      //api call to change password
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      }, { withCredentials: true });

      if (res.data.success) {
        alert("Password changed successfully.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(res.data.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Password change error:", err);
      alert(err.response?.data?.message || "An error occurred.");
    }
  };

  //effect to fetch 2fa status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/profile');
        setVerified(res.data?.isTwoFactorEnabled || false);
      } catch (err) {
        console.error('Failed to fetch 2FA status:', err);
      }
    };
    fetchStatus();
  }, []);


//2fa functionality
  const enable2FA = async () => {
    try {
      setLoading(true);
      const res = await api.get('/2fa/setup');
      setQrCode(res.data.qrCode);
    } catch (err) {
      console.error('Enable 2FA error:', err);
      alert(err.response?.data?.message || 'Unable to enable 2FA.');
    } finally {
      setLoading(false);
    }
  };
//verify 2fa
  const verify2FA = async () => {
    try {
      const res = await api.post('/2fa/verify', { token });
      if (res.data.success) {
        setVerified(true);
        setQrCode(null);
        alert('2FA successfully verified!');
      } else {
        alert('Invalid verification code.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert('Verification failed.');
    }
  };
//disable 2fa
  const disable2FA = async () => {
    try {
      await api.post('/2fa/disable');
      setVerified(false);
      setQrCode(null);
      setToken('');
      alert('2FA has been disabled.');
    } catch (err) {
      console.error('Disable 2FA error:', err);
      alert('Failed to disable 2FA. Please try again.');
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
          boxShadow:
            theme.palette.mode === 'dark'
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
          Settings
        </Typography>

        {/* 2FA Section */}
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            ...textStyle,
            color: theme.palette.text.primary
          }}
        >
          2-Factor Authentication
        </Typography>

        {!qrCode && !verified && (
          <Button
            onClick={enable2FA}
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={textStyle}
          >
            {loading ? 'Loading…' : 'Enable 2FA'}
          </Button>
        )}

        {qrCode && !verified && (
          <>
            <Box sx={{ my: 3 }}>
              <img
                src={qrCode}
                alt="QR Code"
                style={{
                  margin: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  padding: '12px',
                  backgroundColor: '#fff'
                }}
              />
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter code from your authenticator app"
              value={token}
              onChange={(e) => setToken(e.target.value)}
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
              onClick={verify2FA}
              variant="contained"
              color="success"
              fullWidth
              sx={textStyle}
            >
              Verify Code
            </Button>
          </>
        )}

        {verified && !qrCode && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" sx={{ color: 'green', mb: 2, ...textStyle }}>
              ✅ 2FA is currently enabled for your account.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={disable2FA}
              sx={textStyle}
            >
              Disable 2FA
            </Button>
          </Box>
        )}

        {/* Change Password Section */}
        <Box sx={{ mt: 6, textAlign: 'left' }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              ...textStyle,
              color: theme.palette.text.primary
            }}
          >
            Change Password
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Current Password"
            variant="outlined"
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
            type="password"
            label="New Password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            type="password"
            label="Confirm New Password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, ...textStyle }}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </Box>

        {/* Privacy Policy Link */}
        <Box sx={{ mt: 6 }}>
          <Link href="/policy" underline="hover" sx={textStyle}>
            View Privacy Policy
          </Link>
        </Box>
      </Box>
    </Container>
  );
}