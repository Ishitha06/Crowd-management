const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  manager_name: String,
  zone_id: String
});

module.exports = mongoose.model("Manager", managerSchema);