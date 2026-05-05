const mongoose = require("mongoose");

const zoneStatsSchema = new mongoose.Schema({
  zone_id: String,
  timestamp: Date,
  current_count: Number,
  capacity: Number,
  entry_rate: Number,
  exit_rate: Number,
  density: Number
});

module.exports = mongoose.model("ZoneStats", zoneStatsSchema);