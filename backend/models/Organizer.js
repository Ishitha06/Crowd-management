const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  organizer_name: String,
  total_zones: Number
});

module.exports = mongoose.model("Organizer", organizerSchema);