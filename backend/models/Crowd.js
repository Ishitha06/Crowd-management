const mongoose = require("mongoose");

const crowdSchema = new mongoose.Schema({
  zone_id: String,
  entry: Number,
  exit: Number,
  timestamp: Date
});

module.exports = mongoose.model("Crowd", crowdSchema);