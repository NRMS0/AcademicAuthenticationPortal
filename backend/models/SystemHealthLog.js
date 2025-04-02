const mongoose = require('mongoose');

//System Health Schema
const systemHealthLogSchema = new mongoose.Schema({
  status: { type: String, required: true }, 
  dbStatus: { type: String, required: true }, 
  memoryUsage: { type: Number, required: true }, 
  cpuUsage: { type: Number, required: true }, 
  timestamp: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('SystemHealthLog', systemHealthLogSchema);