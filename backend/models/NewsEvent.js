const mongoose = require("mongoose");

//News Schema
const newsEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }, 
  type: { type: String, enum: ["news", "event"], required: true }, 
  startDate: { type: Date }, 
  endDate: { type: Date }, 
});

module.exports = mongoose.model("NewsEvent", newsEventSchema);