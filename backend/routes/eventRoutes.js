const express = require("express");
const router = express.Router();

const {
  initializeEvent,
  getZones,
  getHeatmap,
  blockZone,
  resetBlocks
} = require("../controllers/eventControllers");

// ================= ROUTES =================

// Initialize event
router.post("/initialize", initializeEvent);

// Get zone data
router.get("/zones", getZones);

// Get heatmap (ML prediction)
router.get("/heatmap", getHeatmap);

// Block a zone
router.post("/block", blockZone);

router.post("/reset-blocks", resetBlocks);

module.exports = router;

