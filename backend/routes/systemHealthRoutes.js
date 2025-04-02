const express = require('express');
const router = express.Router();
const os = require('os');
const mongoose = require('mongoose');
const SystemHealthLog = require('../models/SystemHealthLog'); 

// Function to log system health data
const logSystemHealth = async () => {
  try {
    // Check Database Connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    // Check System Resources
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // Check CPU Usage
    // Average CPU load over the last 1 minute
    const cpuUsage = os.loadavg()[0]; 

    // Create a new log entry
    const logEntry = new SystemHealthLog({
      status: 'Healthy', 
      dbStatus,
      memoryUsage,
      cpuUsage,
    });

    // Save the log entry to the database
    await logEntry.save();
    console.log("System health logged:", logEntry);
  } catch (error) {
    console.error("Error logging system health:", error);
  }
};

// Log system health every 5 minutes 
setInterval(logSystemHealth, 300000);

// System Health Endpoint
router.get('/', async (req, res) => {
  try {
    // Fetch the latest system health logs, the last 10 entries this can be changed to offer more logs.
    const logs = await SystemHealthLog.find().sort({ timestamp: -1 }).limit(10);

    // Check Database Connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    // Check System Resources
    const systemUptimeSeconds = os.uptime();
    const hours = Math.floor(systemUptimeSeconds / 3600);
    const minutes = Math.floor((systemUptimeSeconds % 3600) / 60);
    const seconds = Math.floor(systemUptimeSeconds % 60);
    const systemUptime = `${hours}h ${minutes}m ${seconds}s`;

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // You can replace this with actual API check login 
    // For now it is based on if the server is running.
    const apiStatus = 'OK';

    // Response Data
    const healthData = {
      status: 'Healthy',
      dbStatus,
      apiStatus,
      systemUptime,
      memoryUsage: `${memoryUsage.toFixed(2)}%`,
      cpuUsage: `${os.loadavg()[0].toFixed(2)}%`,
      lastChecked: new Date().toISOString(),
      logs, 
    };

    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({ status: 'Unhealthy', error: error.message });
  }
});

module.exports = router;