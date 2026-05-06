const Zone = require("../models/Zone");
const Manager = require("../models/Manager");
const Organizer = require("../models/Organizer");
const Crowd = require("../models/Crowd");
const ZoneStats = require("../models/ZoneStats");
const axios = require("axios");

// ================= RANDOM DATA =================
function generateRandomData(zones) {
  const zone = zones[Math.floor(Math.random() * zones.length)];

  let entry = Math.floor(Math.random() * 10);
  let exit = Math.floor(Math.random() * 10);

  const pattern = Math.random();

  if (pattern < 0.3) {
    entry += Math.floor(Math.random() * 5); // increase
  } else if (pattern > 0.6) {
    exit += Math.floor(Math.random() * 5); // decrease
  }

  return { zone, entry, exit, timestamp: new Date() };
}

// ================= INIT EVENT =================
exports.initializeEvent = async (req, res) => {
  const { zones, capacity } = req.body;

  try {
    if (!zones || !capacity || !Array.isArray(capacity)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    if (capacity.length !== zones) {
      return res.status(400).json({ error: "Capacity mismatch" });
    }

    await Zone.deleteMany({});
    await Manager.deleteMany({});
    await Organizer.deleteMany({});
    await Crowd.deleteMany({});
    await ZoneStats.deleteMany({});

    await Organizer.create({
      organizer_name: "Admin",
      total_zones: zones
    });

    let zoneDocs = [];

    for (let i = 0; i < zones; i++) {
      let z = await Zone.create({
        zone_id: `Z${i + 1}`,
        zone_name: `Zone ${i + 1}`,
        capacity: capacity[i],
        current_count: 0,
        entry_allowed: true
      });

      zoneDocs.push(z);

      await Manager.create({
        manager_name: `Manager ${i + 1}`,
        zone_id: z.zone_id
      });
    }

    let crowdLogs = [];
    let statsLogs = [];

    // ================= SIMULATION =================
    for (let i = 0; i < 5000; i++) {
      let { zone, entry, exit, timestamp } =
        generateRandomData(zoneDocs);

      if (!zone.entry_allowed) entry = 0;

      // prevent overflow
      if (zone.current_count + entry > zone.capacity) {
        entry = zone.capacity - zone.current_count;
      }

      zone.current_count += (entry - exit);

      if (zone.current_count < 0) zone.current_count = 0;

      crowdLogs.push({
        zone_id: zone.zone_id,
        entry,
        exit,
        timestamp
      });

      statsLogs.push({
        zone_id: zone.zone_id,
        timestamp,
        current_count: zone.current_count,
        capacity: zone.capacity,
        entry_rate: entry,
        exit_rate: exit,
        density: zone.current_count / zone.capacity
      });
    }

    await Crowd.insertMany(crowdLogs);
    await ZoneStats.insertMany(statsLogs);

    for (let z of zoneDocs) await z.save();

    res.json({ message: "Data generated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ZONES =================
exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find();

    const result = zones.map(z => {
      let density = z.current_count / z.capacity;
      density = Number(density.toFixed(2));

    //   let risk = "CONTROLLED";

    //   if (density >= 0.85) risk = "CRITICAL";
    //   else if (density >= 0.65) risk = "HIGH";
    //   else if (density >= 0.4) risk = "MEDIUM";

    let risk = "CONTROLLED";

if (z.blocked) {
  risk = "BLOCKED";   // 🔥 ADD THIS
}
else if (density >= 0.85) risk = "CRITICAL";
else if (density >= 0.65) risk = "HIGH";
else if (density >= 0.4) risk = "MEDIUM";

      return {
        zone_id: z.zone_id,
        current_count: z.current_count,
        capacity: z.capacity,
        density,
        risk,
        entry_allowed: z.entry_allowed,
        blocked: z.blocked
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= HEATMAP =================
exports.getHeatmap = async (req, res) => {
  try {
    const zones = await Zone.find();

    let formatted = [];

    for (let z of zones) {

  // 🛑 STEP 1: SKIP BLOCKED ZONES
  if (z.blocked) {
    formatted.push({
      zone_id: z.zone_id,
      entry_rate: 0,
      exit_rate: 0,
      density: z.current_count / z.capacity
    });
    continue; // ❗ VERY IMPORTANT
  }

  let entry = Math.floor(Math.random() * (z.capacity * 0.2));
  let exit = Math.floor(Math.random() * (z.capacity * 0.2));

  const behavior = Math.random();

  if (behavior < 0.25) {
    entry += Math.floor(z.capacity * 0.1);
  }
  else if (behavior < 0.5) {
    // normal
  }
  else if (behavior < 0.75) {
    exit += Math.floor(z.capacity * 0.2);
  }
  else {
    z.current_count = Math.floor(Math.random() * (z.capacity * 0.3));
  }

  if (!z.entry_allowed) entry = 0;

  z.current_count += (entry - exit);

  if (z.current_count < 0) z.current_count = 0;
  if (z.current_count > z.capacity) z.current_count = z.capacity;

  if (Math.random() < 0.3) {
    z.current_count = Math.floor(Math.random() * (z.capacity * 0.3));
  }

  await z.save();

  formatted.push({
    zone_id: z.zone_id,
    entry_rate: entry,
    exit_rate: exit,
    density: z.current_count / z.capacity
  });
}





    // for (let z of zones) {
    //   let entry = Math.floor(Math.random() * (z.capacity * 0.2));
    //   let exit = Math.floor(Math.random() * (z.capacity * 0.2));

    //   const behavior = Math.random();

    //   // 🔥 KEY FIX: force all crowd scenarios
    //   if (behavior < 0.25) {
    //     // 🟥 crowd surge
    //     entry += Math.floor(z.capacity * 0.1);
    //   }
    //   else if (behavior < 0.5) {
    //     // 🟧 moderate
    //   }
    //   else if (behavior < 0.75) {
    //     // 🟩 decreasing (CONTROLLED)
    //     exit += Math.floor(z.capacity * 0.2);
    //   }
    //   else {
    //     // 🟩 very low crowd (FORCED CONTROLLED)
    //     z.current_count = Math.floor(Math.random() * (z.capacity * 0.3));
    //   }

    //   if (!z.entry_allowed) entry = 0;

    //   z.current_count += (entry - exit);

    //   // clamp values
    //   if (z.current_count < 0) z.current_count = 0;
    //   if (z.current_count > z.capacity) z.current_count = z.capacity;

    //   // 🔥 EXTRA PUSH to controlled
    //   if (Math.random() < 0.3) {
    //     z.current_count = Math.floor(Math.random() * (z.capacity * 0.3));
    //   }

    //   await z.save();

    //   formatted.push({
    //     zone_id: z.zone_id,
    //     entry_rate: entry,
    //     exit_rate: exit,
    //     density: z.current_count / z.capacity
    //   });
    // }

    // const response = await axios.post("http://127.0.0.1:5001/predict", {
    //   zones: formatted
    // });

    // res.json(response.data);

    const response = await axios.post("http://127.0.0.1:5001/predict", {
  zones: formatted
});

let predictions = response.data.predictions;
let risks = response.data.risk_levels;

// 🔥 STEP 4: OVERRIDE BLOCKED ZONES HERE
for (let i = 0; i < zones.length; i++) {
  if (zones[i].blocked) {
    risks[i] = "BLOCKED";   // override risk
    predictions[i] = 0;     // optional (keeps UI stable)
  }
}

// return modified result
res.json({
  predictions,
  risk_levels: risks,
  heatmap: response.data.heatmap
});


  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "ML service failed" });
  }
};

// ================= BLOCK =================

exports.blockZone = async (req, res) => {
  const { zone_id } = req.body;

  await Zone.findOneAndUpdate(
    { zone_id },
    { blocked: true }
  );

  res.json({ message: "Zone blocked" });
};


// exports.blockZone = async (req, res) => {
//   const { zone_id } = req.body;

//   await Zone.updateOne(
//     { zone_id },
//     { entry_allowed: false }
//   );

//   res.json({ message: "Zone blocked" });
// };


// ================= RESET BLOCKS =================
exports.resetBlocks = async (req, res) => {
  try {
    await Zone.updateMany({}, { blocked: false });
    res.json({ message: "All zones unblocked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};