// renderer.js — Mason Navigator Kiosk
import {
  schoolGraph,
  allRooms,
  getRoomFloor,
  getNodeFloor,
  STAIR_NODES,
} from "../data/schoolGraph.js";
import { findShortestPath } from "../data/pathfinding.js";
import { displayRooms } from "../data/displayRooms.js";
import { coordinates_floor1 } from "../data/coordinates_floor1.js";
import { coordinates_floor2 } from "../data/coordinates_floor2.js";
import { coordinates_floor3 } from "../data/coordinates_floor3.js";

// ══════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════
const COORDS = {
  1: coordinates_floor1,
  2: coordinates_floor2,
  3: coordinates_floor3,
};
const IMG_SIZE = { 1: [2000, 1428], 2: [2000, 1428], 3: [2000, 1363] };
const IMG_SRC = {
  1: "../assets/floor1.png",
  2: "../assets/floor2.png",
  3: "../assets/floor3.png",
};

const SECONDARY = new Set(["Z2", "A2", "B2"]);
const POD_LABELS = {
  A_Pod: "A Pod",
  B_Pod: "B Pod",
  C_Pod: "C Pod",
  Z_Pod: "Z Pod",
  D_Wing: "D Wing",
  E_Wing: "E Wing",
  F_Wing: "F Wing",
  Commons: "Commons",
  Lobby: "Front Office / Lobby",
};
const STAIR_DESC = {
  C_Stair: "C Stairwell (inside C Pod, near C108/C115)",
  B_Stair: "B Stairwell (B Pod/Commons junction, near B114)",
  A_Stair: "A Stairwell (B Pod/A Pod connector, near B101)",
  Z_Stair: "Z Stairwell (A Pod/Z Pod junction, near A122 area/Z127)",
  Z2: "Z2 connector stairwell (between Z Pod and A Pod)",
  A2: "A2 connector stairwell (between A Pod and B Pod) — going up: B is RIGHT, A is LEFT",
  B2: "B2 connector stairwell (between B Pod and C Pod)",
  Front_Stair: "front office stairwell (connects floors 1 and 2 only)",
};
const WALK_DESC = {
  "C_Pod->Commons":
    "Walk south through C Pod past C100 (Food Court) into the Commons",
  "Commons->C_Pod": "Walk north from the Commons through C100 into C Pod",
  "B_Pod->Commons": "Walk west through B Pod into the Commons",
  "Commons->B_Pod": "Walk east from the Commons into B Pod",
  "B_Pod->C_Pod":
    "Walk northwest through B Pod toward C Pod (near B114/B Stairwell)",
  "C_Pod->B_Pod": "Walk southeast through C Pod toward B Pod",
  "A_Pod->B_Pod":
    "Walk northwest through the A–B connector into B Pod (past B100/B125b — A2 stairwell is here)",
  "B_Pod->A_Pod":
    "Walk southeast through the A–B connector into A Pod (past B100/B125b — A2 stairwell is here)",
  "A_Pod->Z_Pod":
    "Walk south through A Pod toward the lobby area (near A11) into Z Pod",
  "Z_Pod->A_Pod":
    "Walk north through Z Pod past the lobby (near A11) into A Pod",
  "Commons->D_Wing":
    "Walk west from the Commons into D Wing (shortcut: use the C115 cutthrough hallway to reach D101 directly)",
  "D_Wing->Commons": "Walk east through D Wing back into the Commons",
  "D_Wing->E_Wing": "Continue west through D Wing into E Wing",
  "E_Wing->D_Wing": "Walk east through E Wing back into D Wing",
  "D_Wing->F_Wing": "Continue west through D Wing into F Wing",
  "F_Wing->D_Wing": "Walk east through F Wing back into D Wing",
  "A_Pod->Lobby":
    "Walk toward the front of A Pod — follow the hallway past the display cases to the front office lobby",
  "Lobby->A_Pod":
    "Exit the front office lobby and walk down the hallway past the display cases into A Pod (A100 area)",
  "C_Pod->Lobby":
    "Walk through C Pod toward the Harvard Room (C125) area — continue down that hallway to the front office lobby",
  "Lobby->C_Pod":
    "Exit the front office lobby and walk down the hallway past the Harvard Room (C125) area into C Pod (C100 area)",
};

// ══════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════
let config = {
  kioskName: "Mason High School",
  defaultRoom: "Z122",
  defaultFloor: 1,
  idleTimeout: 30,
  devMode: false,
  fontSize: "normal",
};
let currentFloor = 1;
let currentPath = null;
let idleRemaining = 30;
let idleTimer = null;
let animFrame = null;
let accessLarge = false;
let selectedStart = "Z122"; // driven by the two start buttons

// ══════════════════════════════════════════════════════
//  DOM REFS
// ══════════════════════════════════════════════════════
const kioskLabel = document.getElementById("kioskLabel");
const hereName = document.getElementById("hereName");
const destInput = document.getElementById("destInput");
const acDrop = document.getElementById("ac");
const goBtn = document.getElementById("goBtn");
const statusMsg = document.getElementById("statusMsg");
const dirPanel = document.getElementById("dirPanel");
const mapImg = document.getElementById("mapImg");
const mapCanvas = document.getElementById("mapCanvas");
const mapArea = document.getElementById("mapArea");
const floorTabs = document.getElementById("floorTabs");
const idleOverlay = document.getElementById("idleOverlay");
const idleCount = document.getElementById("idleCount");
const idleFill = document.getElementById("idleFill");
const ctx = mapCanvas.getContext("2d");

// ══════════════════════════════════════════════════════
//  START LOCATION BUTTONS
// ══════════════════════════════════════════════════════
document.querySelectorAll(".start-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedStart = btn.dataset.room;
    document
      .querySelectorAll(".start-btn")
      .forEach((b) => b.classList.toggle("active", b === btn));
    // Clear route since start changed
    currentPath = null;
    dirPanel.innerHTML = "";
    dirPanel.classList.remove("show");
    setStatus("", "");
    clearRouteTabs();
    drawAll();
    resetIdle();
  });
});

// ══════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════
async function loadConfig() {
  if (window.kioskAPI) {
    const c = await window.kioskAPI.getConfig();
    if (c) config = { ...config, ...c };
  }
  applyConfig();
}

function applyConfig() {
  kioskLabel.textContent = config.kioskName;
  // hereName handled by start buttons
  document.documentElement.dataset.size = config.fontSize || "normal";
  accessLarge = config.fontSize === "large";
  resetIdle();
}

// ══════════════════════════════════════════════════════
//  IDLE TIMER
// ══════════════════════════════════════════════════════
function resetIdle() {
  idleRemaining = parseInt(config.idleTimeout) || 30;
  idleCount.textContent = idleRemaining;
  idleFill.style.transition = "none";
  idleFill.style.width = "100%";
  requestAnimationFrame(() => {
    idleFill.style.transition = `width ${idleRemaining}s linear`;
    idleFill.style.width = "0%";
  });
  idleOverlay.classList.remove("show");
  clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    idleRemaining--;
    idleCount.textContent = Math.max(0, idleRemaining);
    if (idleRemaining <= 0) {
      clearInterval(idleTimer);
      showIdle();
    }
  }, 1000);
}

function showIdle() {
  idleOverlay.classList.add("show");
}
function dismissIdle() {
  resetIdle();
  resetAll();
}

["click", "keydown", "touchstart", "mousemove"].forEach((e) =>
  document.addEventListener(e, resetIdle, { passive: true }),
);
document.getElementById("idleCta").addEventListener("click", dismissIdle);
idleOverlay.addEventListener("click", dismissIdle);

// ══════════════════════════════════════════════════════
//  RESET
// ══════════════════════════════════════════════════════
function resetAll() {
  destInput.value = "";
  setStatus("", "");
  dirPanel.innerHTML = "";
  dirPanel.classList.remove("show");
  currentPath = null;
  acDrop.classList.remove("open");
  acDrop.innerHTML = "";
  // Reset start selection to Student Entrance
  selectedStart = "Z122";
  document
    .querySelectorAll(".start-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.room === "Z122"));
  setFloor(parseInt(config.defaultFloor) || 1);
  clearRouteTabs();
}

document.getElementById("resetBtn").addEventListener("click", resetAll);

// ══════════════════════════════════════════════════════
//  ACCESSIBILITY
// ══════════════════════════════════════════════════════
document.getElementById("accessBtn").addEventListener("click", () => {
  accessLarge = !accessLarge;
  document.documentElement.dataset.size = accessLarge ? "large" : "normal";
  config.fontSize = accessLarge ? "large" : "normal";
});

// ══════════════════════════════════════════════════════
//  FLOOR SWITCHING
// ══════════════════════════════════════════════════════
floorTabs
  .querySelectorAll(".floor-tab")
  .forEach((tab) =>
    tab.addEventListener("click", () => setFloor(parseInt(tab.dataset.floor))),
  );

function setFloor(floor) {
  currentFloor = floor;
  floorTabs
    .querySelectorAll(".floor-tab")
    .forEach((t) =>
      t.classList.toggle("active", parseInt(t.dataset.floor) === floor),
    );
  mapImg.src = IMG_SRC[floor];
  mapImg.onload = () => {
    syncCanvas();
    drawAll();
  };
  if (mapImg.complete && mapImg.naturalWidth) {
    syncCanvas();
    drawAll();
  }
}

function clearRouteTabs() {
  floorTabs
    .querySelectorAll(".floor-tab")
    .forEach((t) => t.classList.remove("has-route"));
}

function markRouteTabs(path) {
  const floors = new Set();
  for (const node of path) {
    const f = nodeFloor(node);
    if (f) floors.add(f);
  }
  floorTabs.querySelectorAll(".floor-tab").forEach((t) => {
    t.classList.toggle("has-route", floors.has(parseInt(t.dataset.floor)));
  });
}

// ══════════════════════════════════════════════════════
//  CANVAS
// ══════════════════════════════════════════════════════
function syncCanvas() {
  const imgRect = mapImg.getBoundingClientRect();
  const areaRect = mapArea.getBoundingClientRect();
  const left = imgRect.left - areaRect.left;
  const top = imgRect.top - areaRect.top;

  mapCanvas.style.left = left + "px";
  mapCanvas.style.top = top + "px";
  mapCanvas.style.width = imgRect.width + "px";
  mapCanvas.style.height = imgRect.height + "px";
  mapCanvas.width = imgRect.width;
  mapCanvas.height = imgRect.height;
}

window.addEventListener("resize", () => {
  syncCanvas();
  drawAll();
});
new ResizeObserver(() => {
  syncCanvas();
  drawAll();
}).observe(mapArea);

function toCanvas(nodeOrKey, floor) {
  const c = COORDS[floor]?.[nodeOrKey];
  if (!c) return null;
  const [iw, ih] = IMG_SIZE[floor];
  return {
    x: c.x * (mapCanvas.width / iw),
    y: c.y * (mapCanvas.height / ih),
  };
}

function nodeFloor(node) {
  if (allRooms[node]) return getRoomFloor(node);
  if (node === "Lobby_1") return 1;
  if (node === "Lobby_2") return 2;
  if (STAIR_NODES.has(node)) return null;
  return getNodeFloor(node);
}

// ══════════════════════════════════════════════════════
//  DRAWING
// ══════════════════════════════════════════════════════
function drawAll() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

  if (!currentPath || currentPath.length < 2) {
    pulseHere();
    return;
  }

  // Collect points for current floor only
  const pts = [];
  for (const node of currentPath) {
    const nf = nodeFloor(node);
    if (nf === currentFloor || nf === null) {
      const p = toCanvas(node, currentFloor);
      if (p) pts.push({ node, p });
    }
  }

  const startPt = toCanvas(selectedStart, currentFloor);
  const endNode = currentPath[currentPath.length - 1];
  const endPt = toCanvas(endNode, currentFloor);
  const endOnFloor = nodeFloor(endNode) === currentFloor;

  animateLine(
    pts.map((x) => x.p),
    () => {
      // After animation: draw start + end dots
      if (startPt) drawDot(startPt.x, startPt.y, 8, "#003087", "#fff");
      if (pts.length > 0) {
        const lastPt = pts[pts.length - 1];
        const isStair = STAIR_NODES.has(lastPt.node);
        const color = isStair ? "#ff6600" : endOnFloor ? "#cc2200" : "#ff6600";
        drawDot(lastPt.p.x, lastPt.p.y, 8, color, "#fff");
        const lbl = isStair ? "▲ Use Stairs" : displayRooms[endNode] || endNode;
        drawLabel(lastPt.p.x, lastPt.p.y - 15, lbl);
      }
      if (startPt) drawLabel(startPt.x, startPt.y - 15, "You Are Here");
      // Keep pulsing the start dot
      pulseHereStatic(startPt);
    },
  );
}

function animateLine(points, onDone) {
  if (points.length < 2) {
    onDone?.();
    return;
  }

  // Calculate total length
  let total = 0;
  for (let i = 1; i < points.length; i++)
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );

  const SPEED = 700; // px/sec
  let progress = 0,
    last = null;

  function frame(ts) {
    if (!last) last = ts;
    progress = Math.min(progress + SPEED * ((ts - last) / 1000), total);
    last = ts;

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Build partial polyline
    let rem = progress;
    const partial = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const seg = Math.hypot(
        points[i].x - points[i - 1].x,
        points[i].y - points[i - 1].y,
      );
      if (rem >= seg) {
        partial.push(points[i]);
        rem -= seg;
      } else {
        const t = rem / seg;
        partial.push({
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        });
        break;
      }
    }

    // Glow
    ctx.beginPath();
    ctx.moveTo(partial[0].x, partial[0].y);
    for (let i = 1; i < partial.length; i++)
      ctx.lineTo(partial[i].x, partial[i].y);
    ctx.strokeStyle = "rgba(26,122,26,0.22)";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Main line
    ctx.beginPath();
    ctx.moveTo(partial[0].x, partial[0].y);
    for (let i = 1; i < partial.length; i++)
      ctx.lineTo(partial[i].x, partial[i].y);
    ctx.strokeStyle = "#1a7a1a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Moving dot tip
    const tip = partial[partial.length - 1];
    drawDot(tip.x, tip.y, 5, "#fff", "#1a7a1a");

    if (progress < total) {
      animFrame = requestAnimationFrame(frame);
    } else {
      onDone?.();
    }
  }
  animFrame = requestAnimationFrame(frame);
}

// Pulsing "you are here" when no route
function pulseHere() {
  const p = toCanvas(selectedStart, currentFloor);
  if (!p) return;
  let tick = 0;
  function frame() {
    if (currentPath && currentPath.length >= 2) return;
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    tick++;
    const ring = 10 + Math.sin(tick * 0.06) * 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ring, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,48,135,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawDot(p.x, p.y, 7, "#003087", "#fff");
    drawLabel(p.x, p.y - 15, "You Are Here");
    animFrame = requestAnimationFrame(frame);
  }
  animFrame = requestAnimationFrame(frame);
}

function pulseHereStatic(p) {
  if (!p) return;
  drawDot(p.x, p.y, 7, "#003087", "#fff");
}

function drawDot(x, y, r, fill, stroke) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLabel(x, y, text) {
  ctx.font = "bold 11px Inter,sans-serif";
  ctx.textAlign = "center";
  const m = ctx.measureText(text);
  const w = m.width + 12,
    h = 17;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  roundRect(ctx, x - w / 2, y - h + 2, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#0d1a0d";
  ctx.fillText(text, x, y - 1);
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

// ══════════════════════════════════════════════════════
//  AUTOCOMPLETE
// ══════════════════════════════════════════════════════
const roomList = Object.entries(displayRooms).sort(([a], [b]) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
);

let acIdx = -1;

destInput.addEventListener("input", () => {
  // Auto uppercase
  const pos = destInput.selectionStart;
  destInput.value = destInput.value.toUpperCase();
  destInput.setSelectionRange(pos, pos);

  const q = destInput.value.trim();
  acIdx = -1;
  if (!q) {
    acDrop.classList.remove("open");
    acDrop.innerHTML = "";
    return;
  }

  const hits = roomList
    .filter(
      ([room, label]) => room.startsWith(q) || label.toUpperCase().includes(q),
    )
    .slice(0, 9);

  if (!hits.length) {
    acDrop.classList.remove("open");
    return;
  }

  acDrop.innerHTML = hits
    .map(
      ([room, label]) =>
        `<div class="ac-item" data-room="${room}">
       <span class="ac-room">${room}</span>
       <span class="ac-name">${label !== room ? label.replace(room, "").replace(/^[\s–-]+/, "") : ""}</span>
     </div>`,
    )
    .join("");

  acDrop
    .querySelectorAll(".ac-item")
    .forEach((el) =>
      el.addEventListener("click", () => pickRoom(el.dataset.room)),
    );
  acDrop.classList.add("open");
});

destInput.addEventListener("keydown", (e) => {
  const items = acDrop.querySelectorAll(".ac-item");
  if (!items.length) {
    if (e.key === "Enter") go();
    return;
  }

  if (e.key === "ArrowDown") {
    acIdx = Math.min(acIdx + 1, items.length - 1);
    syncAcHighlight(items);
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    acIdx = Math.max(acIdx - 1, 0);
    syncAcHighlight(items);
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (acIdx >= 0 && items[acIdx]) pickRoom(items[acIdx].dataset.room);
    else go();
  } else if (e.key === "Escape") {
    acDrop.classList.remove("open");
  }
});

function syncAcHighlight(items) {
  items.forEach((el, i) => el.classList.toggle("hi", i === acIdx));
  if (items[acIdx]) items[acIdx].scrollIntoView({ block: "nearest" });
}

function pickRoom(room) {
  destInput.value = room;
  acDrop.classList.remove("open");
  go();
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#ac") && !e.target.closest("#destInput"))
    acDrop.classList.remove("open");
});

// ══════════════════════════════════════════════════════
//  ROUTING
// ══════════════════════════════════════════════════════
goBtn.addEventListener("click", go);

function go() {
  const start = (selectedStart || "").trim().toUpperCase();
  const end = destInput.value.trim().toUpperCase();
  setStatus("", "");

  if (!end) return setStatus("Enter a destination room.", "error");
  if (start === end) return setStatus("You're already there! 🎉", "info");
  if (!schoolGraph[start])
    return setStatus(`Start room "${start}" not in system.`, "error");
  if (!schoolGraph[end])
    return setStatus(`Room "${end}" not found. Check the spelling.`, "error");

  const path = findShortestPath(schoolGraph, start, end);
  if (!path) return setStatus("No route found between those rooms.", "error");

  currentPath = path;
  renderDirections(path, start, end);
  markRouteTabs(path);

  // Jump to start floor, then after short delay let user see route
  const sf = getRoomFloor(start) || 1;
  setFloor(sf);
}

function setStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = type;
  statusMsg.style.display = msg ? "block" : "none";
}

// ══════════════════════════════════════════════════════
//  DIRECTIONS
// ══════════════════════════════════════════════════════
function getPodKey(node) {
  if (!node) return null;
  if (node === "Lobby_1" || node === "Lobby_2") return "Lobby";
  const m = node.match(/^([A-Z](?:_Pod|_Wing))_\d$/);
  if (m) return m[1];
  if (node.startsWith("Commons_")) return "Commons";
  return null;
}

function podLabel(node) {
  const k = getPodKey(node);
  return k ? POD_LABELS[k] || k.replace(/_/g, " ") : node.replace(/_/g, " ");
}

function floorLabel(f) {
  return f === 1 ? "1st" : f === 2 ? "2nd" : "3rd";
}

function isAdminRoom(r) {
  if (!r.startsWith("A")) return false;
  const n = parseInt(r.replace(/\D/g, ""), 10);
  if (n === 32) return false; // A32 is Nurse's Office, not admin
  return (n >= 14 && n <= 31) || (n >= 51 && n <= 71);
}

function renderDirections(path, start, end) {
  const sf = getRoomFloor(start) || 1;
  const ef = getRoomFloor(end) || 1;
  let prevFloor = sf;
  let prevPod = schoolGraph[start]?.[0] || null;
  const steps = [];
  let stairs = 0;

  // Step 1: origin
  steps.push({
    icon: "📍",
    main: `<strong>${displayRooms[start] || start}</strong>`,
    sub: `${floorLabel(sf)} floor · ${podLabel(prevPod)}`,
  });

  for (let i = 1; i < path.length; i++) {
    const node = path[i];

    // ── Stairwell ──
    if (STAIR_NODES.has(node)) {
      stairs++;
      let toFloor = prevFloor;
      for (let j = i + 1; j < path.length; j++) {
        const f = nodeFloor(path[j]);
        if (f) {
          toFloor = f;
          break;
        }
      }
      const dir =
        toFloor > prevFloor ? "up" : toFloor < prevFloor ? "down" : "across";
      const icon = dir === "up" ? "⬆️" : dir === "down" ? "⬇️" : "↔️";
      steps.push({
        icon,
        main: `Take the <strong>${STAIR_DESC[node] || node}</strong> <strong>${dir}</strong> to the <strong>${floorLabel(toFloor)} floor</strong>`,
        sub: `Look for stairwell signs`,
      });
      prevFloor = toFloor;
      continue;
    }

    // ── Hub node (pod / lobby / commons) ──
    if (
      /^[A-Z](?:_Pod|_Wing)_\d$/.test(node) ||
      /^Commons_\d$/.test(node) ||
      node === "Lobby_1" ||
      node === "Lobby_2"
    ) {
      const pk = getPodKey(prevPod);
      const ck =
        getPodKey(node) || (node.startsWith("Commons") ? "Commons" : null);

      if (pk && ck && pk === ck) {
        prevPod = node;
        continue;
      }

      const key = `${pk}->${ck}`;
      const desc =
        WALK_DESC[key] || `Walk from ${podLabel(prevPod)} to ${podLabel(node)}`;

      steps.push({
        icon: "🚶",
        main: desc,
        sub: `${floorLabel(prevFloor)} floor`,
      });
      prevPod = node;
      continue;
    }

    // ── Destination ──
    if (node === end) {
      let warn = null;
      if (end === "B129")
        warn = "⚠ Only accessible through Dream Center (B125) first.";
      else if (end.startsWith("C126") && end !== "C126")
        warn = `⚠ ${end} is inside C126 — enter through C126 first.`;
      else if (end === "C125")
        warn =
          "Note: Harvard Room is auditorium-style, not on the main hallway.";
      else if (["C123", "C124", "C130"].includes(end))
        warn = "Note: This room is in the curved lobby area.";
      else if (end === "A32")
        warn =
          "Nurse's Office — accessible from A100 (the inter-pod corridor outside the main A Pod hallway).";
      else if (end === "A32")
        warn =
          "Nurse's Office — accessible from A100 (the inter-pod corridor outside the main A Pod hallway).";
      else if (isAdminRoom(end))
        warn =
          "Admin suite (A14–A31) — enter via the front office lobby, right side behind A11.";

      steps.push({
        icon: "🎯",
        main: `<strong>${displayRooms[end] || end}</strong>`,
        sub: `${floorLabel(ef)} floor · ${podLabel(schoolGraph[end]?.[0])}`,
        warn,
      });
    }
  }

  // Build HTML
  const floors = [...new Set([sf, ef])].sort();
  const floorBadge =
    floors.length > 1
      ? `<span class="badge badge-floor">Floors ${floors.join(" → ")}</span>`
      : `<span class="badge badge-floor">Floor ${floors[0]}</span>`;
  const stairBadge =
    stairs > 0
      ? `<span class="badge badge-stairs">🪜 ${stairs} stairwell${stairs > 1 ? "s" : ""}</span>`
      : "";

  dirPanel.innerHTML = `
    <div class="dir-hdr">
      <div class="dir-route">
        ${displayRooms[start] || start} → <strong>${displayRooms[end] || end}</strong>
      </div>
      <div class="dir-badges">${floorBadge}${stairBadge}</div>
    </div>
    <ul class="dir-steps">
      ${steps
        .map(
          (s, i) => `
        <li class="dir-step" style="animation-delay:${i * 0.07}s">
          <span class="step-ico">${s.icon}</span>
          <div>
            <div class="step-main">${s.main}</div>
            <div class="step-sub">${s.sub}</div>
            ${s.warn ? `<div class="step-warn">${s.warn}</div>` : ""}
          </div>
        </li>`,
        )
        .join("")}
    </ul>`;
  dirPanel.classList.add("show");
}

// ══════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════
document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("cfgName").value = config.kioskName;
  document.getElementById("cfgRoom").value = config.defaultRoom;
  document.getElementById("cfgFloor").value = config.defaultFloor || 1;
  document.getElementById("cfgTimeout").value = config.idleTimeout;
  document.getElementById("cfgDev").value = String(config.devMode || false);
  document.getElementById("settingsOverlay").classList.add("show");
});
document
  .getElementById("cfgCancel")
  .addEventListener("click", () =>
    document.getElementById("settingsOverlay").classList.remove("show"),
  );
document.getElementById("cfgSave").addEventListener("click", async () => {
  config.kioskName =
    document.getElementById("cfgName").value || config.kioskName;
  config.defaultRoom =
    document.getElementById("cfgRoom").value.toUpperCase() ||
    config.defaultRoom;
  config.defaultFloor =
    parseInt(document.getElementById("cfgFloor").value) || 1;
  config.idleTimeout =
    parseInt(document.getElementById("cfgTimeout").value) || 30;
  config.devMode = document.getElementById("cfgDev").value === "true";
  if (window.kioskAPI) await window.kioskAPI.saveConfig(config);
  document.getElementById("settingsOverlay").classList.remove("show");
  applyConfig();
  resetAll();
});

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
await loadConfig();
setFloor(parseInt(config.defaultFloor) || 1);
