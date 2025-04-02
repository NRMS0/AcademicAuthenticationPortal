import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, CircularProgress, Grid, Chip, List, ListItem, ListItemText } from "@mui/material";
import api from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const textStyle = {
    fontWeight: theme.textWeights[theme.fontWeight],
    ...theme.textSizeStyles[theme.textSize],
    color: theme.palette.text.primary
  };

  const paperStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}`,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0px 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0px 4px 20px rgba(0, 0, 0, 0.1)',
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await api.get("/system-health");
      setHealthData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching system health data:", error);
      setError("Failed to fetch system health data.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={textStyle}>{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>

      {/* System Health Metrics */}
      <Paper elevation={3} sx={{ p: 3, mt: 2, ...paperStyle }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>Backend Status</Typography>
            <Chip
              label={healthData.status}
              color={healthData.status === "Healthy" ? "success" : "error"}
              sx={textStyle}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>Database Status</Typography>
            <Chip
              label={healthData.dbStatus}
              color={healthData.dbStatus === "Connected" ? "success" : "error"}
              sx={textStyle}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>Memory Usage</Typography>
            <Typography sx={textStyle}>{healthData.memoryUsage}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>CPU Usage</Typography>
            <Typography sx={textStyle}>{healthData.cpuUsage}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>System Uptime</Typography>
            <Typography sx={textStyle}>{healthData.systemUptime}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>API Status</Typography>
            <Chip
              label={healthData.apiStatus}
              color={healthData.apiStatus === "OK" ? "success" : "error"}
              sx={textStyle}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={textStyle}>Last Checked</Typography>
            <Typography sx={textStyle}>{new Date(healthData.lastChecked).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* System Health Logs */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, ...paperStyle }}>
        <Typography variant="h5" gutterBottom sx={textStyle}>
          System Health Logs
        </Typography>
        <List>
          {healthData.logs.map((log, index) => (
            <ListItem key={index}>
              <ListItemText
                primaryTypographyProps={{ sx: textStyle }}
                secondaryTypographyProps={{ sx: textStyle }}
                primary={`${new Date(log.timestamp).toLocaleString()}`}
                secondary={
                  `Status: ${log.status}, DB: ${log.dbStatus}, Memory: ${log.memoryUsage.toFixed(2)}%, CPU: ${log.cpuUsage.toFixed(2)}%`
                }
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, ...textStyle }}>
          Logs are updated every 5 minutes.
        </Typography>
      </Paper>
    </Container>
  );
}