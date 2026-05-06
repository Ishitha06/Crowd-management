// ================= REGISTER =================
function register() {
  const u = document.getElementById("regUser").value.trim();
  const p = document.getElementById("regPass").value.trim();
  const c = document.getElementById("regConfirm").value.trim();

  if (!u || !p || !c) {
    showToast("Fill all fields", "error");
    return;
  }

  if (p !== c) {
    showToast("Passwords do not match", "error");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ username: u, password: p }));
  showToast("Registered Successfully", "success");
}


// ================= LOGIN =================
function login() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();

  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.username === u && user.password === p) {
    showToast("Login Successful", "success");

    setTimeout(() => {
      window.location.href = "form.html";
    }, 1000);

  } else {
    showToast("Invalid login", "error");
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

  if (capacity.length !== Number(zones)) {
    showToast("Capacity count must match number of zones", "error");
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
      showToast("Backend error", "error");
      return;
    }

    showToast("Database Linked Successfully", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (err) {
    console.log(err);
    showToast("Server not reachable", "error");
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

      if (z.blocked || z.risk === "BLOCKED") {
        btn.innerText = `BLOCKED ${z.zone_id}`;
        btn.style.background = "#9ca3af";
        btn.disabled = true;
        btn.style.cursor = "not-allowed";
      } else {
        btn.innerText = `STOP ${z.zone_id}`;
        btn.style.background = "#ff9933";
        btn.style.cursor = "pointer";
        btn.onclick = () => stopZone(z.zone_id);
      }

      btn.style.color = "black";
      btn.style.margin = "8px";
      btn.style.padding = "10px 16px";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.fontWeight = "bold";

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

    showToast(zone_id + " blocked", "info");

    loadZones();

  } catch (err) {
    console.log("BLOCK ERROR:", err);
  }
}


// ================= UPDATE BUTTON =================
async function update() {
  try {
    await fetch("http://127.0.0.1:5000/api/event/reset-blocks", {
      method: "POST"
    });

    loadZones();
    loadHeatmap();

  } catch (err) {
    console.log("RESET ERROR:", err);
  }
}


// ================= LOAD ON DASHBOARD =================
window.onload = () => {
  if (window.location.pathname.includes("dashboard")) {
    loadZones();
    loadHeatmap();
  }
};


// ================= TOAST =================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}