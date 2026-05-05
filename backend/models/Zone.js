const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  zone_id: String,
  zone_name: String,
  capacity: Number,
  current_count: Number,
  entry_allowed: Boolean
});

module.exports = mongoose.model("Zone", zoneSchema);