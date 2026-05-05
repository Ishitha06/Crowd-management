// ================= REGISTER =================
function register() {
  const u = document.getElementById("regUser").value.trim();
  const p = document.getElementById("regPass").value.trim();
  const c = document.getElementById("regConfirm").value.trim();

  if (!u || !p || !c) {
    alert("Fill all fields");
    return;
  }

  if (p !== c) {
    alert("Passwords do not match");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ username: u, password: p }));
  alert("Registered Successfully");
}


// ================= LOGIN =================
function login() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();

  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.username === u && user.password === p) {
    window.location.href = "form.html";
  } else {
    alert("Invalid login");
  }
}


// ================= INITIALIZE EVENT =================
async function initialize() {
  const zones = document.getElementById("zones").value;
  const capacityInput = document.getElementById("capacity").value;

  const capacity = capacityInput
    .split(",")
    .map(num => Number(num.trim()))
    .filter(num => !isNaN(num));

  // 🔥 VALIDATION FIX
  if (capacity.length !== Number(zones)) {
    alert("Capacity count must match number of zones");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/api/event/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        zones: Number(zones),
        capacity
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Backend error: " + JSON.stringify(data));
      return;
    }

    alert("Database Linked Successfully");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.log(err);
    alert("Server not reachable");
  }
}


// ================= LOAD ZONES =================
async function loadZones() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/event/zones");
    const zones = await res.json();

    const container = document.getElementById("zoneButtons");
    if (!container) return;

    container.innerHTML = "";

    zones.forEach(z => {
      const btn = document.createElement("button");

      // TEXT
      btn.innerText = `STOP ${z.zone_id}`;

      // 🎨 COLOR BASED ON RISK
    //   if (z.risk === "CRITICAL") btn.style.background = "#e60000";   // deep red
    //   else if (z.risk === "HIGH") btn.style.background = "#ff8000";  // orange
    //   else if (z.risk === "MEDIUM") btn.style.background = "#ffd633"; // yellow
    //   else btn.style.background = "#4CAF50"; // green (controlled)

    // ✅ SAME COLOR FOR ALL BUTTONS
btn.style.background = "#ff9933";   // or any color you like
btn.style.color = "black";

      // STYLE
      btn.style.color = "black";
      btn.style.margin = "8px";
      btn.style.padding = "10px 16px";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.fontWeight = "bold";

      btn.onclick = () => stopZone(z.zone_id);

      container.appendChild(btn);
    });

  } catch (err) {
    console.log("LOAD ZONES ERROR:", err);
  }
}


// ================= LOAD HEATMAP =================
async function loadHeatmap() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/event/heatmap");
    const data = await res.json();

    const img = document.getElementById("heatmap");
    if (!img) return;

    if (!data.heatmap) {
      console.log("No heatmap received");
      return;
    }

    img.src = "data:image/png;base64," + data.heatmap;

  } catch (err) {
    console.log("HEATMAP ERROR:", err);
  }
}


// ================= STOP ZONE =================
async function stopZone(zone_id) {
  try {
    await fetch("http://127.0.0.1:5000/api/event/block", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ zone_id })
    });

    alert(zone_id + " blocked");

    // refresh only buttons (not heatmap)
    loadZones();

  } catch (err) {
    console.log("BLOCK ERROR:", err);
  }
}


// ================= UPDATE BUTTON =================
function update() {
  loadZones();
  loadHeatmap();
}


// ================= LOAD ON DASHBOARD =================
window.onload = () => {
  if (window.location.pathname.includes("dashboard")) {
    loadZones();
    loadHeatmap();
  }
};