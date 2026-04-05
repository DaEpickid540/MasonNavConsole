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
import {
  hallways,
  getHallwaysForFloor,
  getHallwayForRoom,
  getHallwayWaypoints,
} from "../data/hallways.js";

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

// ── Route waypoints ─────────────────────────────────────────────
// When drawing a line between two hub nodes, inject these intermediate
// points so the line follows the actual hallway rather than cutting
// through walls. Keyed as "FROM->TO" (bidirectional — code handles both).
// Coordinates are in the same pixel space as coordinates_floor*.js
// ROUTE_WAYPOINTS: intermediate corridor points so lines follow hallways.
// All coordinates match the corrected hub positions in coordinates_floor*.js
// Key insight: each path goes through actual corridor centerlines, not open space.
// ROUTE_WAYPOINTS: intermediate corridor points so lines follow hallways.
// All coordinates match the corrected hub positions in coordinates_floor*.js
// Key insight: each path goes through actual corridor centerlines, not open space.
const ROUTE_WAYPOINTS = {
  // ═══ FLOOR 1 ═══════════════════════════════════════════════════

  // B Pod ↔ A Pod: runs south through B100 area, bends at A_Stair, enters A Pod corridor
  "B_Pod_1->A_Pod_1": [
    { x: 1550, y: 740 }, // B_Pod_1
    { x: 1550, y: 840 }, // descend through B-A connector hallway
    { x: 1600, y: 870 }, // A_Stair area
    { x: 1600, y: 960 }, // A_Pod_1
  ],
  "A_Pod_1->B_Pod_1": [
    { x: 1600, y: 960 },
    { x: 1600, y: 870 },
    { x: 1550, y: 840 },
    { x: 1550, y: 740 },
  ],

  // A Pod ↔ Z Pod: A Pod corridor south-west to Z_Stair then Z Pod
  "A_Pod_1->Z_Pod_1": [
    { x: 1600, y: 960 },
    { x: 1567, y: 968 }, // Z_Stair
    { x: 1507, y: 1040 }, // Z_Pod_1
  ],
  "Z_Pod_1->A_Pod_1": [
    { x: 1507, y: 1040 },
    { x: 1567, y: 968 },
    { x: 1600, y: 960 },
  ],

  // A Pod ↔ Lobby: east A Pod hallway straight west to Lobby
  "A_Pod_1->Lobby_1": [
    { x: 1600, y: 960 },
    { x: 1510, y: 960 }, // mid-corridor
    { x: 1445, y: 950 }, // Lobby_1
  ],
  "Lobby_1->A_Pod_1": [
    { x: 1445, y: 950 },
    { x: 1510, y: 960 },
    { x: 1600, y: 960 },
  ],

  // B Pod ↔ C Pod: west through B114 stairwell area then C Pod hallway
  "B_Pod_1->C_Pod_1": [
    { x: 1550, y: 740 },
    { x: 1415, y: 655 }, // B_Stair / B114
    { x: 1393, y: 660 }, // HW_BC_1
    { x: 1310, y: 660 }, // C_Pod_1
  ],
  "C_Pod_1->B_Pod_1": [
    { x: 1310, y: 660 },
    { x: 1393, y: 660 },
    { x: 1415, y: 655 },
    { x: 1550, y: 740 },
  ],

  // B Pod ↔ Commons: west along B Pod to Commons
  "B_Pod_1->Commons_1": [
    { x: 1550, y: 740 },
    { x: 1415, y: 655 }, // B_Stair area
    { x: 1393, y: 660 }, // HW_BC_1
    { x: 1295, y: 695 }, // Commons_1
  ],
  "Commons_1->B_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1393, y: 660 },
    { x: 1415, y: 655 },
    { x: 1550, y: 740 },
  ],

  // C Pod ↔ Commons: south through C100
  "C_Pod_1->Commons_1": [
    { x: 1310, y: 660 },
    { x: 1295, y: 695 },
  ],
  "Commons_1->C_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1310, y: 660 },
  ],

  // Commons ↔ Z Pod: through main hallway bend
  "Commons_1->Z_Pod_1": [
    { x: 1295, y: 695 },
    { x: 1295, y: 860 }, // south through lobby area
    { x: 1445, y: 950 }, // Lobby_1 corridor
    { x: 1507, y: 1040 }, // Z_Pod_1
  ],
  "Z_Pod_1->Commons_1": [
    { x: 1507, y: 1040 },
    { x: 1445, y: 950 },
    { x: 1295, y: 860 },
    { x: 1295, y: 695 },
  ],

  // Commons ↔ D Wing
  "Commons_1->D_Wing_1": [
    { x: 1295, y: 695 },
    { x: 1230, y: 650 }, // HW_main_1
    { x: 1115, y: 500 }, // HW_D_entry
    { x: 1060, y: 500 }, // D_Wing_1
  ],
  "D_Wing_1->Commons_1": [
    { x: 1060, y: 500 },
    { x: 1115, y: 500 },
    { x: 1230, y: 650 },
    { x: 1295, y: 695 },
  ],

  // C Pod ↔ D Wing: north-west through C115/C114 area
  "C_Pod_1->D_Wing_1": [
    { x: 1310, y: 660 },
    { x: 1230, y: 650 },
    { x: 1115, y: 500 },
    { x: 1060, y: 500 },
  ],
  "D_Wing_1->C_Pod_1": [
    { x: 1060, y: 500 },
    { x: 1115, y: 500 },
    { x: 1230, y: 650 },
    { x: 1310, y: 660 },
  ],

  // Lobby_1 ↔ C Pod: west lobby corridor to Commons to C Pod
  "Lobby_1->C_Pod_1": [
    { x: 1445, y: 950 },
    { x: 1295, y: 860 },
    { x: 1295, y: 695 },
    { x: 1310, y: 660 },
  ],
  "C_Pod_1->Lobby_1": [
    { x: 1310, y: 660 },
    { x: 1295, y: 695 },
    { x: 1295, y: 860 },
    { x: 1445, y: 950 },
  ],

  // ═══ FLOOR 2 ═══════════════════════════════════════════════════

  "B_Pod_2->A_Pod_2": [
    { x: 1545, y: 742 },
    { x: 1545, y: 840 },
    { x: 1598, y: 870 },
    { x: 1600, y: 962 },
  ],
  "A_Pod_2->B_Pod_2": [
    { x: 1600, y: 962 },
    { x: 1598, y: 870 },
    { x: 1545, y: 840 },
    { x: 1545, y: 742 },
  ],

  "A_Pod_2->Z_Pod_2": [
    { x: 1600, y: 962 },
    { x: 1563, y: 968 },
    { x: 1503, y: 1043 },
  ],
  "Z_Pod_2->A_Pod_2": [
    { x: 1503, y: 1043 },
    { x: 1563, y: 968 },
    { x: 1600, y: 962 },
  ],

  "A_Pod_2->Lobby_2": [
    { x: 1600, y: 962 },
    { x: 1510, y: 962 },
    { x: 1445, y: 950 },
  ],
  "Lobby_2->A_Pod_2": [
    { x: 1445, y: 950 },
    { x: 1510, y: 962 },
    { x: 1600, y: 962 },
  ],

  "B_Pod_2->C_Pod_2": [
    { x: 1545, y: 742 },
    { x: 1412, y: 658 },
    { x: 1390, y: 660 },
    { x: 1302, y: 670 },
  ],
  "C_Pod_2->B_Pod_2": [
    { x: 1302, y: 670 },
    { x: 1390, y: 660 },
    { x: 1412, y: 658 },
    { x: 1545, y: 742 },
  ],

  "B_Pod_2->Commons_2": [
    { x: 1545, y: 742 },
    { x: 1412, y: 658 },
    { x: 1390, y: 660 },
    { x: 1290, y: 700 },
  ],
  "Commons_2->B_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1390, y: 660 },
    { x: 1412, y: 658 },
    { x: 1545, y: 742 },
  ],

  "C_Pod_2->Commons_2": [
    { x: 1302, y: 670 },
    { x: 1290, y: 700 },
  ],
  "Commons_2->C_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1302, y: 670 },
  ],

  "Commons_2->Z_Pod_2": [
    { x: 1290, y: 700 },
    { x: 1290, y: 860 },
    { x: 1445, y: 950 },
    { x: 1503, y: 1043 },
  ],
  "Z_Pod_2->Commons_2": [
    { x: 1503, y: 1043 },
    { x: 1445, y: 950 },
    { x: 1290, y: 860 },
    { x: 1290, y: 700 },
  ],

  "Commons_2->D_Wing_2": [
    { x: 1290, y: 700 },
    { x: 1225, y: 652 },
    { x: 1132, y: 588 },
    { x: 1069, y: 605 },
  ],
  "D_Wing_2->Commons_2": [
    { x: 1069, y: 605 },
    { x: 1132, y: 588 },
    { x: 1225, y: 652 },
    { x: 1290, y: 700 },
  ],

  "Lobby_2->C_Pod_2": [
    { x: 1445, y: 950 },
    { x: 1290, y: 860 },
    { x: 1290, y: 700 },
    { x: 1302, y: 670 },
  ],
  "C_Pod_2->Lobby_2": [
    { x: 1302, y: 670 },
    { x: 1290, y: 700 },
    { x: 1290, y: 860 },
    { x: 1445, y: 950 },
  ],

  // ═══ FLOOR 3 ═══════════════════════════════════════════════════

  "B_Pod_3->A_Pod_3": [
    { x: 1500, y: 712 },
    { x: 1500, y: 800 },
    { x: 1592, y: 785 },
    { x: 1600, y: 900 },
  ],
  "A_Pod_3->B_Pod_3": [
    { x: 1600, y: 900 },
    { x: 1592, y: 785 },
    { x: 1500, y: 800 },
    { x: 1500, y: 712 },
  ],

  "A_Pod_3->Z_Pod_3": [
    { x: 1600, y: 900 },
    { x: 1545, y: 912 },
    { x: 1500, y: 1012 },
  ],
  "Z_Pod_3->A_Pod_3": [
    { x: 1500, y: 1012 },
    { x: 1545, y: 912 },
    { x: 1600, y: 900 },
  ],

  "B_Pod_3->C_Pod_3": [
    { x: 1500, y: 712 },
    { x: 1435, y: 668 },
    { x: 1370, y: 645 },
    { x: 1205, y: 613 },
  ],
  "C_Pod_3->B_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1370, y: 645 },
    { x: 1435, y: 668 },
    { x: 1500, y: 712 },
  ],

  "B_Pod_3->Commons_3": [
    { x: 1500, y: 712 },
    { x: 1435, y: 668 },
    { x: 1370, y: 645 },
    { x: 1205, y: 613 },
  ],
  "Commons_3->B_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1370, y: 645 },
    { x: 1435, y: 668 },
    { x: 1500, y: 712 },
  ],

  "C_Pod_3->Commons_3": [
    { x: 1205, y: 613 },
    { x: 1205, y: 613 },
  ],
  "Commons_3->C_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1205, y: 613 },
  ],

  "Commons_3->Z_Pod_3": [
    { x: 1205, y: 613 },
    { x: 1290, y: 860 },
    { x: 1500, y: 1012 },
  ],
  "Z_Pod_3->Commons_3": [
    { x: 1500, y: 1012 },
    { x: 1290, y: 860 },
    { x: 1205, y: 613 },
  ],
};

// Inject waypoints between two consecutive hub nodes if a mapping exists
function getWaypointsBetween(fromNode, toNode, floor) {
  const key = `${fromNode}->${toNode}`;
  const pts = ROUTE_WAYPOINTS[key];
  if (!pts) return null;
  // Scale from image pixels to canvas pixels
  const [iw, ih] = IMG_SIZE[floor];
  return pts.map((p) => ({
    x: p.x * (mapCanvas.width / iw),
    y: p.y * (mapCanvas.height / ih),
  }));
}

/**
 * Get hallway-based waypoints for a room-to-room route
 * Looks up which hallways connect the rooms and uses their waypoints
 */
function getHallwayWaypointsForRoute(fromRoom, toRoom, floor) {
  const fromHallway = getHallwayForRoom(fromRoom);
  const toHallway = getHallwayForRoom(toRoom);

  if (!fromHallway || !toHallway) return null;

  // If both rooms are in the same hallway, use that hallway's waypoints
  if (fromHallway.hallwayId === toHallway.hallwayId) {
    const waypts = fromHallway.waypoints || [];
    if (waypts.length < 2) return null;

    const [iw, ih] = IMG_SIZE[floor];
    return waypts.map((p) => ({
      x: p.x * (mapCanvas.width / iw),
      y: p.y * (mapCanvas.height / ih),
    }));
  }

  // If in different hallways, combine waypoints from both
  const combined = [];
  const floorHallways = getHallwaysForFloor(floor);

  // Add waypoints from starting hallway
  if (fromHallway.waypoints) {
    combined.push(...fromHallway.waypoints);
  }

  // Add waypoints from ending hallway
  if (toHallway.waypoints) {
    combined.push(...toHallway.waypoints);
  }

  if (combined.length < 2) return null;

  const [iw, ih] = IMG_SIZE[floor];
  return combined.map((p) => ({
    x: p.x * (mapCanvas.width / iw),
    y: p.y * (mapCanvas.height / ih),
  }));
}

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
let showLines = false; // route lines off by default (beta feature)
let showGrid = false; // grid overlay off by default
let showAllPoints = false; // show all coordinate points (dev mode)
let showHallways = false; // show hallway lines (dev mode)
let selectedCoordPoint = null; // currently selected point in coordinates editor
let disableIdleAndIntro = false; // disable intro screen and auto-lock
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

// Hover tracking for dev points
let hoverPoint = null;
let mouseX = 0;
let mouseY = 0;

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
//  IDLE TIMER / HOME SCREEN
// ══════════════════════════════════════════════════════

// restartCountdown: restart the 30s bar. Does NOT touch the overlay.
// Called on every user interaction so timer resets while app is in use.
function restartCountdown() {
  // If idle is disabled, skip the countdown
  if (disableIdleAndIntro) return;

  // If the home/idle screen is showing, don't let background activity dismiss it.
  if (idleOverlay.classList.contains("show")) return;

  idleRemaining = parseInt(config.idleTimeout) || 30;
  idleCount.textContent = idleRemaining;
  idleFill.style.transition = "none";
  idleFill.style.width = "100%";
  requestAnimationFrame(() => {
    idleFill.style.transition = `width ${idleRemaining}s linear`;
    idleFill.style.width = "0%";
  });
  clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    idleRemaining--;
    idleCount.textContent = Math.max(0, idleRemaining);
    if (idleRemaining <= 0) {
      clearInterval(idleTimer);
      triggerIdleReset();
    }
  }, 1000);
}

// resetIdle: alias used by applyConfig
function resetIdle() {
  restartCountdown();
}

// triggerIdleReset: called when timer hits 0 — wipes all state, shows home screen
function triggerIdleReset() {
  resetAll();
  showHomeScreen();
}

function showHomeScreen() {
  idleOverlay.classList.add("show");
}

// dismissHomeScreen: ONLY called via the CTA button tap
function dismissHomeScreen() {
  idleOverlay.classList.remove("show");
  restartCountdown();
}

// Activity resets the countdown bar only — does NOT dismiss the overlay
["click", "keydown", "touchstart", "mousemove"].forEach((e) =>
  document.addEventListener(e, restartCountdown, { passive: true }),
);
// Only the CTA button can dismiss the home/idle screen
document.getElementById("idleCta").addEventListener("click", dismissHomeScreen);

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
  const oldQR = document.getElementById("qrPanel");
  if (oldQR) oldQR.remove();
  if (typeof qrCountdownInterval !== "undefined" && qrCountdownInterval) {
    clearInterval(qrCountdownInterval);
    qrCountdownInterval = null;
  }
  // Reset start selection to Student Entrance
  selectedStart = "Z122";
  document
    .querySelectorAll(".start-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.room === "Z122"));
  // Cancel any running animation and clear canvas
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
  ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
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
  if (typeof resetMapZoom === "function") resetMapZoom();
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

  // Collect points for current floor, injecting hallway waypoints between hubs
  const rawPts = [];
  for (const node of currentPath) {
    const nf = nodeFloor(node);
    if (nf === currentFloor || nf === null) {
      const p = toCanvas(node, currentFloor);
      if (p) rawPts.push({ node, p });
    }
  }

  // Build final point list with waypoints injected between hub nodes
  const finalPts = [];
  for (let i = 0; i < rawPts.length; i++) {
    if (i === 0) {
      finalPts.push(rawPts[i].p);
      continue;
    }
    const fromNode = rawPts[i - 1].node;
    const toNode = rawPts[i].node;

    // Try hub-to-hub waypoints first
    let waypts = getWaypointsBetween(fromNode, toNode, currentFloor);

    // If no hub waypoints, try hallway-based waypoints for rooms
    if (!waypts && allRooms[fromNode] && allRooms[toNode]) {
      waypts = getHallwayWaypointsForRoute(fromNode, toNode, currentFloor);
    }

    if (waypts) {
      // Skip the first waypoint if it's very close to the previous point
      for (const wp of waypts.slice(1, -1)) finalPts.push(wp);
    }
    finalPts.push(rawPts[i].p);
  }

  const pts = rawPts; // keep for dot rendering
  const startPt = toCanvas(selectedStart, currentFloor);
  const endNode = currentPath[currentPath.length - 1];
  const endPt = toCanvas(endNode, currentFloor);
  const endOnFloor = nodeFloor(endNode) === currentFloor;

  // Draw grid overlay
  drawGrid();

  // Draw hallway lines (dev mode)
  drawHallways();

  // Draw all points (dev mode)
  drawAllPoints();

  // Only animate and draw lines if showLines is enabled (beta feature)
  if (showLines) {
    animateLine(finalPts, () => {
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
    });
  } else {
    // Lines disabled: show start and end points without the line animation
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    drawGrid();
    // Draw end point
    if (pts.length > 0) {
      const lastPt = pts[pts.length - 1];
      const isStair = STAIR_NODES.has(lastPt.node);
      const color = isStair ? "#ff6600" : endOnFloor ? "#cc2200" : "#ff6600";
      drawDot(lastPt.p.x, lastPt.p.y, 8, color, "#fff");
      const lbl = isStair ? "▲ Use Stairs" : displayRooms[endNode] || endNode;
      drawLabel(lastPt.p.x, lastPt.p.y - 15, lbl);
    }
    // Draw start point
    if (startPt) drawDot(startPt.x, startPt.y, 8, "#003087", "#fff");
    if (startPt) drawLabel(startPt.x, startPt.y - 15, "You Are Here");
    // Keep pulsing the start dot
    pulseHereStatic(startPt);
  }
}

// Draw 100px grid overlay on the map
function drawGrid() {
  if (!showGrid) return; // Only draw if grid is enabled

  const GRID_SPACING = 50; // 50px in image coordinates
  const [iw, ih] = IMG_SIZE[currentFloor];
  const sx = mapCanvas.width / iw;
  const sy = mapCanvas.height / ih;

  ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Red grid with transparency
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  // Vertical lines
  for (let x = 0; x <= iw; x += GRID_SPACING) {
    const canvasX = x * sx;
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, mapCanvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= ih; y += GRID_SPACING) {
    const canvasY = y * sy;
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(mapCanvas.width, canvasY);
    ctx.stroke();
  }
}

// Draw all points from coordinates (development mode)
function drawAllPoints() {
  if (!showAllPoints) return;

  const [iw, ih] = IMG_SIZE[currentFloor];
  const sx = mapCanvas.width / iw;
  const sy = mapCanvas.height / ih;
  const coords = COORDS[currentFloor];

  if (!coords) return;

  // Get hidden points for current floor
  const floorKey = `floor${currentFloor}`;
  const hiddenForFloor = window.hiddenPointsByFloor?.[floorKey] || new Set();

  // Draw all points except hidden ones
  for (const [roomName, coord] of Object.entries(coords)) {
    if (hiddenForFloor.has(roomName)) continue; // Skip hidden points

    const x = coord.x * sx;
    const y = coord.y * sy;

    // Draw selected point in red, others in green
    const isSelected = selectedCoordPoint === roomName;

    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 4 : 2, 0, Math.PI * 2);
    if (isSelected) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 100, 100, 1)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 200, 0, 1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Draw tooltip for hovered point (next to cursor)
  if (hoverPoint && !hiddenForFloor.has(hoverPoint) && coords[hoverPoint]) {
    const coord = coords[hoverPoint];
    const x = coord.x * sx;
    const y = coord.y * sy;

    // Highlight hovered point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label tooltip at cursor position
    const label = displayRooms[hoverPoint] || hoverPoint;
    ctx.font = "bold 12px Inter,sans-serif";
    ctx.textAlign = "left";
    const metrics = ctx.measureText(label);
    const boxW = metrics.width + 8;
    const boxH = 18;
    let boxX = mouseX + 12;
    let boxY = mouseY - 8;

    // Keep tooltip on screen
    if (boxX + boxW > mapCanvas.width) {
      boxX = mapCanvas.width - boxW - 5;
    }
    if (boxY < 0) {
      boxY = mouseY + 12;
    }

    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#000";
    ctx.fillText(label, boxX + 4, boxY + 14);
  }
}

// Get point under mouse cursor
function getPointAtMouse(x, y) {
  const [iw, ih] = IMG_SIZE[currentFloor];
  const sx = mapCanvas.width / iw;
  const sy = mapCanvas.height / ih;
  const coords = COORDS[currentFloor];

  if (!coords) return null;

  const hitRadius = 6; // pixel radius for hit detection
  for (const [roomName, coord] of Object.entries(coords)) {
    const px = coord.x * sx;
    const py = coord.y * sy;
    const dist = Math.hypot(x - px, y - py);
    if (dist < hitRadius) {
      return roomName;
    }
  }
  return null;
}

// Get hallway line under mouse cursor
function getHallwayAtMouse(x, y) {
  const [iw, ih] = IMG_SIZE[currentFloor];
  const sx = mapCanvas.width / iw;
  const sy = mapCanvas.height / ih;
  const floorHallways = hallways[`floor${currentFloor}`] || {};

  const hitRadius = 8; // pixel radius for hit detection on lines

  for (const [hallwayId, hallwayData] of Object.entries(floorHallways)) {
    const waypoints = hallwayData.waypoints || [];
    if (waypoints.length < 2) continue;

    // Check distance from point to each line segment
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dist = distanceToLineSegment(
        x,
        y,
        p1.x * sx,
        p1.y * sy,
        p2.x * sx,
        p2.y * sy,
      );
      if (dist < hitRadius) {
        return { id: hallwayId, data: hallwayData };
      }
    }
  }
  return null;
}

// Calculate distance from point to line segment
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Show point info in sidebar
function showPointInfo(roomName) {
  const sidebar = document.getElementById("infoSidebar");
  const coords = COORDS[currentFloor];

  if (!coords || !coords[roomName]) return;

  const coord = coords[roomName];
  const label = displayRooms[roomName] || roomName;

  document.getElementById("infoName").textContent = label;
  document.getElementById("infoX").textContent = Math.round(coord.x);
  document.getElementById("infoY").textContent = Math.round(coord.y);
  document.getElementById("infoEndRow").style.display = "none";
  document.getElementById("infoEndYRow").style.display = "none";

  sidebar.style.display = "block";
}

// Show hallway info in sidebar
function showHallwayInfo(hallwayData) {
  const sidebar = document.getElementById("infoSidebar");
  const waypoints = hallwayData.waypoints || [];

  if (waypoints.length < 2) return;

  const startPt = waypoints[0];
  const endPt = waypoints[waypoints.length - 1];

  document.getElementById("infoName").textContent = hallwayData.name;
  document.getElementById("infoX").textContent = Math.round(startPt.x);
  document.getElementById("infoY").textContent = Math.round(startPt.y);
  document.getElementById("infoEndX").textContent = Math.round(endPt.x);
  document.getElementById("infoEndY").textContent = Math.round(endPt.y);
  document.getElementById("infoEndRow").style.display = "flex";
  document.getElementById("infoEndYRow").style.display = "flex";

  sidebar.style.display = "block";
}

// Hide info sidebar
function hideInfoSidebar() {
  const sidebar = document.getElementById("infoSidebar");
  sidebar.style.display = "none";
}

// Draw hallway lines from hallways.js data
function drawHallways() {
  if (!showHallways) return;

  const [iw, ih] = IMG_SIZE[currentFloor];
  const sx = mapCanvas.width / iw;
  const sy = mapCanvas.height / ih;

  const floorHallways = hallways[`floor${currentFloor}`] || {};

  for (const [hallwayId, hallwayData] of Object.entries(floorHallways)) {
    const waypoints = hallwayData.waypoints || [];
    if (waypoints.length < 2) continue;

    // Draw hallway line
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x * sx, waypoints[0].y * sy);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x * sx, waypoints[i].y * sy);
    }
    ctx.strokeStyle = "rgba(100, 150, 255, 0.6)"; // Semi-transparent blue
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw waypoint circles
    for (let i = 0; i < waypoints.length; i++) {
      const x = waypoints[i].x * sx;
      const y = waypoints[i].y * sy;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
      ctx.fill();
      ctx.strokeStyle = "#6496FF";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw hallway name label at midpoint
    if (waypoints.length > 1) {
      const mid = Math.floor(waypoints.length / 2);
      const midpt = waypoints[mid];
      const x = midpt.x * sx;
      const y = midpt.y * sy;

      ctx.font = "bold 10px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(100, 150, 255, 1)";
      ctx.fillText(hallwayData.name, x, y - 8);
    }
  }
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

    // Redraw grid after clearing
    drawGrid();

    // Draw hallway lines (dev mode)
    drawHallways();

    // Draw all points (dev mode)
    drawAllPoints();

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

    // Glow (Red development)
    ctx.beginPath();
    ctx.moveTo(partial[0].x, partial[0].y);
    for (let i = 1; i < partial.length; i++)
      ctx.lineTo(partial[i].x, partial[i].y);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Main line (Red for development)
    ctx.beginPath();
    ctx.moveTo(partial[0].x, partial[0].y);
    for (let i = 1; i < partial.length; i++)
      ctx.lineTo(partial[i].x, partial[i].y);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Moving dot tip
    const tip = partial[partial.length - 1];
    drawDot(tip.x, tip.y, 5, "#fff", "#ff0000");

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

    // Redraw grid after clearing
    drawGrid();

    // Draw hallway lines (dev mode)
    drawHallways();

    // Draw all points (dev mode)
    drawAllPoints();

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
//  ROUTING & TOGGLES
// ══════════════════════════════════════════════════════

// Load settings from localStorage
function loadSettings() {
  const lines = localStorage.getItem("showLines") === "true";
  const grid = localStorage.getItem("showGrid") === "true";
  const points = localStorage.getItem("showAllPoints") === "true";
  const hallways = localStorage.getItem("showHallways") === "true";
  const disableIdle = localStorage.getItem("disableIdleAndIntro") === "true";

  showLines = lines;
  showGrid = grid;
  showAllPoints = points;
  showHallways = hallways;
  disableIdleAndIntro = disableIdle;

  // Update checkbox UI
  const linesToggle = document.getElementById("linesToggle");
  const gridToggle = document.getElementById("gridToggle");
  const showPointsToggle = document.getElementById("showPointsToggle");
  const showHallwaysToggle = document.getElementById("showHallwaysToggle");

  if (linesToggle) linesToggle.checked = lines;
  if (gridToggle) gridToggle.checked = grid;
  if (showPointsToggle) showPointsToggle.checked = points;
  if (showHallwaysToggle) showHallwaysToggle.checked = hallways;

  const idleToggle = document.getElementById("disableIdleToggle");
  if (idleToggle) idleToggle.checked = disableIdleAndIntro;
}

// Save settings to localStorage
function saveSettings() {
  localStorage.setItem("showLines", showLines);
  localStorage.setItem("showGrid", showGrid);
  localStorage.setItem("showAllPoints", showAllPoints);
  localStorage.setItem("showHallways", showHallways);
  localStorage.setItem("disableIdleAndIntro", disableIdleAndIntro);
}

// Lines beta checkbox
const linesToggle = document.getElementById("linesToggle");
if (linesToggle) {
  linesToggle.addEventListener("change", () => {
    showLines = linesToggle.checked;
    saveSettings();
    drawAll(); // redraw immediately
  });
}

// Grid overlay checkbox
const gridToggle = document.getElementById("gridToggle");
if (gridToggle) {
  gridToggle.addEventListener("change", () => {
    showGrid = gridToggle.checked;
    saveSettings();
    drawAll(); // redraw immediately
  });
}

// Show all points checkbox (dev mode)
const showPointsToggle = document.getElementById("showPointsToggle");
if (showPointsToggle) {
  showPointsToggle.addEventListener("change", () => {
    showAllPoints = showPointsToggle.checked;
    saveSettings();
    hoverPoint = null; // reset hover when toggling
    drawAll(); // redraw immediately
  });
}

// Show hallways checkbox (dev mode)
const showHallwaysToggle = document.getElementById("showHallwaysToggle");
if (showHallwaysToggle) {
  showHallwaysToggle.addEventListener("change", () => {
    showHallways = showHallwaysToggle.checked;
    saveSettings();
    drawAll(); // redraw immediately
  });
}

// Disable idle and intro toggle (dev mode)
const disableIdleToggle = document.getElementById("disableIdleToggle");
if (disableIdleToggle) {
  disableIdleToggle.addEventListener("change", () => {
    disableIdleAndIntro = disableIdleToggle.checked;
    saveSettings();
    if (disableIdleAndIntro) {
      // Dismiss idle overlay if showing
      idleOverlay.classList.remove("show");
      // Clear any active idle timers
      clearInterval(idleTimer);
    } else {
      // Resume normal idle behavior
      restartCountdown();
    }
  });
}

// Initialize hidden points tracking per floor
window.hiddenPointsByFloor = {
  floor1: new Set(),
  floor2: new Set(),
  floor3: new Set(),
};

// Load settings from localStorage (after all toggles are set up)
loadSettings();

// Mouse tracking for point and line hover display
mapCanvas.addEventListener("mousemove", (e) => {
  const rect = mapCanvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (showAllPoints) {
    const newHoverPoint = getPointAtMouse(mouseX, mouseY);
    if (newHoverPoint !== hoverPoint) {
      hoverPoint = newHoverPoint;
      if (hoverPoint) {
        showPointInfo(hoverPoint);
      } else {
        hideInfoSidebar();
      }
      drawAll();
    }
  } else if (showHallways) {
    const hallway = getHallwayAtMouse(mouseX, mouseY);
    if (hallway) {
      showHallwayInfo(hallway.data);
    } else {
      hideInfoSidebar();
    }
  } else {
    hideInfoSidebar();
  }
});

mapCanvas.addEventListener("mouseleave", () => {
  if (hoverPoint !== null) {
    hoverPoint = null;
    drawAll();
  }
  hideInfoSidebar();
});

// Click to select points and show in editor
mapCanvas.addEventListener("click", (e) => {
  if (!showAllPoints) return;

  const rect = mapCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const pointAtMouse = getPointAtMouse(x, y);
  if (pointAtMouse) {
    // Select the point in the coordinates editor
    selectCoordinatePoint(pointAtMouse);

    // Scroll coordinates panel into view if hidden
    if (coordsPanel.style.display === "none") {
      coordsPanel.style.display = "flex";
    }
  }
});

// ════════════════════════════════════════════════════════════════
// COORDINATES EDITOR PANEL
// ════════════════════════════════════════════════════════════════

const coordsPanel = document.getElementById("panelCoords");
const coordsList = document.getElementById("coordsList");
const coordsSearch = document.getElementById("coordsSearch");
const toggleCoordsPanel = document.getElementById("toggleCoordsPanel");

// Store edited coordinates in memory before saving
const coordsEdits = {};

// Populate coordinates panel with all points for current floor
function populateCoordinatesPanel() {
  const coords = COORDS[currentFloor];
  if (!coords) return;

  coordsList.innerHTML = "";
  coordsEdits[currentFloor] = coordsEdits[currentFloor] || {};

  const roomNames = Object.keys(coords).sort();

  for (const roomName of roomNames) {
    const coord = coords[roomName];
    const label = displayRooms[roomName] || roomName;
    const key = `${currentFloor}-${roomName}`;

    const item = document.createElement("div");
    item.className = "coords-item";
    item.dataset.roomName = roomName;
    item.dataset.key = key;

    const xVal = coordsEdits[currentFloor][roomName]?.x ?? coord.x;
    const yVal = coordsEdits[currentFloor][roomName]?.y ?? coord.y;

    item.innerHTML = `
      <div class="coords-item-name">${label}</div>
      <div class="coords-inputs">
        <div class="coords-input-group">
          <label class="coords-input-label">X</label>
          <input type="number" class="coords-input-field coords-x" value="${xVal}" />
        </div>
        <div class="coords-input-group">
          <label class="coords-input-label">Y</label>
          <input type="number" class="coords-input-field coords-y" value="${yVal}" />
        </div>
      </div>
      <button class="coords-save-btn">Save</button>
    `;

    coordsList.appendChild(item);

    // Add input change listeners
    const xInput = item.querySelector(".coords-x");
    const yInput = item.querySelector(".coords-y");
    const saveBtn = item.querySelector(".coords-save-btn");

    const markModified = () => {
      item.classList.add("modified");
    };

    // Live update as user types (real-time map preview)
    xInput.addEventListener("input", (e) => {
      const newX = parseFloat(e.target.value);
      if (isNaN(newX)) return;

      coordsEdits[currentFloor][roomName] =
        coordsEdits[currentFloor][roomName] || {};
      coordsEdits[currentFloor][roomName].x = newX;

      // Live update the map
      liveUpdateCoordinate(
        roomName,
        newX,
        coordsEdits[currentFloor][roomName].y ?? coord.y,
      );
      markModified();
    });

    yInput.addEventListener("input", (e) => {
      const newY = parseFloat(e.target.value);
      if (isNaN(newY)) return;

      coordsEdits[currentFloor][roomName] =
        coordsEdits[currentFloor][roomName] || {};
      coordsEdits[currentFloor][roomName].y = newY;

      // Live update the map
      liveUpdateCoordinate(
        roomName,
        coordsEdits[currentFloor][roomName].x ?? coord.x,
        newY,
      );
      markModified();
    });

    saveBtn.addEventListener("click", () => {
      saveCoordinateChange(
        roomName,
        parseFloat(xInput.value),
        parseFloat(yInput.value),
      );
      item.classList.remove("modified");
    });

    // Add click handler to select point
    item.addEventListener("click", () => {
      selectCoordinatePoint(roomName);
    });
  }
}

// Select a point in the coordinates editor (highlights red on map)
function selectCoordinatePoint(roomName) {
  // Update selection state
  selectedCoordPoint = roomName;

  // Update UI - remove active class from all items
  const items = coordsList.querySelectorAll(".coords-item");
  for (const item of items) {
    item.classList.remove("active");
  }

  // Add active class to selected item
  const selectedItem = coordsList.querySelector(
    `[data-room-name="${roomName}"]`,
  );
  if (selectedItem) {
    selectedItem.classList.add("active");
    // Scroll into view
    selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Redraw map to show selected point in red
  drawAll();
}

// Live update: show changed coordinate on map immediately (doesn't save to file yet)
function liveUpdateCoordinate(roomName, x, y) {
  if (!COORDS[currentFloor] || !COORDS[currentFloor][roomName]) return;

  // Update in-memory coordinate
  COORDS[currentFloor][roomName].x = x;
  COORDS[currentFloor][roomName].y = y;

  // Redraw map to show updated point position
  drawAll();
}

// Save coordinate change to file permanently
async function saveCoordinateChange(roomName, x, y) {
  if (!COORDS[currentFloor] || !COORDS[currentFloor][roomName]) return;

  // Make sure the latest values are in COORDS
  COORDS[currentFloor][roomName].x = x;
  COORDS[currentFloor][roomName].y = y;

  // Prepare the update
  const updateData = {
    floor: currentFloor,
    roomName: roomName,
    x: x,
    y: y,
  };

  try {
    // Call Electron IPC to save coordinates to file
    const result = await window.kioskAPI.saveCoordinates(updateData);
    if (result.success) {
      // Clear the edit cache on successful save
      delete coordsEdits[currentFloor][roomName];
      // Visual feedback: show that it's saved
      const item = coordsList.querySelector(`[data-room-name="${roomName}"]`);
      if (item) {
        item.classList.remove("modified");
        item.classList.add("saved");
        setTimeout(() => {
          item.classList.remove("saved");
        }, 1500);
      }
    } else {
      throw new Error(result.error || "Failed to save");
    }
  } catch (error) {
    console.error("Failed to save coordinate:", error);
    alert(`Failed to save: ${error.message}`);
  }
}

// Filter coordinates list by search
coordsSearch.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const items = coordsList.querySelectorAll(".coords-item");

  for (const item of items) {
    const roomName = item.dataset.roomName;
    const label = (displayRooms[roomName] || roomName).toLowerCase();
    const matches =
      label.includes(searchTerm) || roomName.toLowerCase().includes(searchTerm);
    item.style.display = matches ? "" : "none";
  }
});

// Toggle coordinates panel
toggleCoordsPanel.addEventListener("click", () => {
  const isVisible = coordsPanel.style.display !== "none";
  coordsPanel.style.display = isVisible ? "none" : "flex";
});

// Populate panel when floor changes
const originalSetFloor = window.setFloor;
window.setFloor = function (floor) {
  originalSetFloor(floor);
  selectedCoordPoint = null; // Clear selection when changing floors
  populateCoordinatesPanel();
};

// Initial population
populateCoordinatesPanel();

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
  generateQR(start, end); // ← QR code (after renderDirections so dirPanel is visible)
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
//  MAP ZOOM / PAN
// ══════════════════════════════════════════════════════
let mapZoom = 1;
let mapPanX = 0;
let mapPanY = 0;
let isPanning = false;
let panStart = { x: 0, y: 0 };

const mapWrap = mapArea; // alias

function applyMapTransform() {
  const t = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;
  mapImg.style.transform = t;
  mapCanvas.style.transform = t;
  mapImg.style.transformOrigin = "0 0";
  mapCanvas.style.transformOrigin = "0 0";
}

function clampPan() {
  // Allow pan within reasonable bounds (don't let image disappear off screen)
  const areaRect = mapArea.getBoundingClientRect();
  const imgW = mapCanvas.width * mapZoom;
  const imgH = mapCanvas.height * mapZoom;
  const minX = Math.min(0, areaRect.width - imgW);
  const minY = Math.min(0, areaRect.height - imgH);
  mapPanX = Math.max(minX, Math.min(0, mapPanX));
  mapPanY = Math.max(minY, Math.min(0, mapPanY));
}

// Scroll wheel zoom
mapArea.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const rect = mapArea.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    const newZoom = Math.max(1, Math.min(6, mapZoom * delta));
    // Zoom toward mouse position
    mapPanX = mouseX - (mouseX - mapPanX) * (newZoom / mapZoom);
    mapPanY = mouseY - (mouseY - mapPanY) * (newZoom / mapZoom);
    mapZoom = newZoom;
    if (mapZoom <= 1) {
      mapPanX = 0;
      mapPanY = 0;
    }
    clampPan();
    applyMapTransform();
  },
  { passive: false },
);

// Double-click: zoom in and center on click point
mapArea.addEventListener("dblclick", (e) => {
  e.preventDefault();
  const rect = mapArea.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if (mapZoom >= 3.5) {
    // Already zoomed — reset
    mapZoom = 1;
    mapPanX = 0;
    mapPanY = 0;
  } else {
    const newZoom = Math.min(6, mapZoom * 2);
    mapPanX = mouseX - (mouseX - mapPanX) * (newZoom / mapZoom);
    mapPanY = mouseY - (mouseY - mapPanY) * (newZoom / mapZoom);
    mapZoom = newZoom;
    clampPan();
  }
  mapImg.style.transition = "transform 0.25s ease";
  mapCanvas.style.transition = "transform 0.25s ease";
  applyMapTransform();
  setTimeout(() => {
    mapImg.style.transition = "";
    mapCanvas.style.transition = "";
  }, 260);
});

// Pinch-to-zoom (touch)
let lastPinchDist = null;
mapArea.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 2) {
      lastPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    } else if (e.touches.length === 1) {
      isPanning = true;
      panStart = {
        x: e.touches[0].clientX - mapPanX,
        y: e.touches[0].clientY - mapPanY,
      };
    }
  },
  { passive: true },
);

mapArea.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 2 && lastPinchDist) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const rect = mapArea.getBoundingClientRect();
      const centerX =
        (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY =
        (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      const delta = dist / lastPinchDist;
      const newZoom = Math.max(1, Math.min(6, mapZoom * delta));
      mapPanX = centerX - (centerX - mapPanX) * (newZoom / mapZoom);
      mapPanY = centerY - (centerY - mapPanY) * (newZoom / mapZoom);
      mapZoom = newZoom;
      if (mapZoom <= 1) {
        mapPanX = 0;
        mapPanY = 0;
      }
      clampPan();
      applyMapTransform();
      lastPinchDist = dist;
    } else if (e.touches.length === 1 && isPanning && mapZoom > 1) {
      mapPanX = e.touches[0].clientX - panStart.x;
      mapPanY = e.touches[0].clientY - panStart.y;
      clampPan();
      applyMapTransform();
    }
  },
  { passive: false },
);

mapArea.addEventListener("touchend", () => {
  lastPinchDist = null;
  isPanning = false;
});

// Mouse pan (when zoomed in)
mapArea.addEventListener("mousedown", (e) => {
  if (mapZoom <= 1) return;
  isPanning = true;
  panStart = { x: e.clientX - mapPanX, y: e.clientY - mapPanY };
  mapArea.style.cursor = "grabbing";
});
window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  mapPanX = e.clientX - panStart.x;
  mapPanY = e.clientY - panStart.y;
  clampPan();
  applyMapTransform();
});
window.addEventListener("mouseup", () => {
  isPanning = false;
  mapArea.style.cursor = mapZoom > 1 ? "grab" : "default";
});

// Reset zoom when floor changes
function resetMapZoom() {
  mapZoom = 1;
  mapPanX = 0;
  mapPanY = 0;
  applyMapTransform();
}

// ══════════════════════════════════════════════════════════════
//  QR CODE — encodes route as URL, shows panel with countdown
// ══════════════════════════════════════════════════════════════

// Your GitHub Pages base URL — update to match your actual repo
const ROUTE_BASE_URL =
  "https://daepickid540.github.io/School-Map/src/route.html";
const QR_EXPIRY_MIN = 30;

let qrCountdownInterval = null;

function generateQR(start, end) {
  // Encode: start, end, unix timestamp in seconds
  const ts = Math.floor(Date.now() / 1000);
  const url = `${ROUTE_BASE_URL}?s=${encodeURIComponent(start)}&e=${encodeURIComponent(end)}&t=${ts}`;

  // Remove old panel if exists
  const old = document.getElementById("qrPanel");
  if (old) old.remove();
  if (qrCountdownInterval) {
    clearInterval(qrCountdownInterval);
    qrCountdownInterval = null;
  }

  // Build panel
  const panel = document.createElement("div");
  panel.id = "qrPanel";
  panel.innerHTML = `
    <div class="qr-header">
      <span class="qr-title">📱 Scan for Mobile Route</span>
      <button class="qr-close" id="qrClose">✕</button>
    </div>
    <div class="qr-body">
      <div id="qrCanvas"></div>
      <div class="qr-meta">
        <div class="qr-route">${start} → ${end}</div>
        <div class="qr-expiry">
          Expires in <strong id="qrCountdown">${QR_EXPIRY_MIN}:00</strong>
        </div>
        <div class="qr-bar-wrap"><div class="qr-bar" id="qrBar"></div></div>
      </div>
    </div>`;
  dirPanel.appendChild(panel);

  document.getElementById("qrClose").addEventListener("click", () => {
    panel.remove();
    if (qrCountdownInterval) {
      clearInterval(qrCountdownInterval);
      qrCountdownInterval = null;
    }
  });

  // Generate QR using qrcodejs (loaded via CDN in index.html)
  if (window.QRCode) {
    new QRCode(document.getElementById("qrCanvas"), {
      text: url,
      width: 160,
      height: 160,
      colorDark: "#003087",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  } else {
    document.getElementById("qrCanvas").innerHTML =
      `<div class="qr-fallback">QR library not loaded.<br>Add qrcodejs script to index.html</div>`;
  }

  // Countdown timer
  const deadline = Date.now() + QR_EXPIRY_MIN * 60 * 1000;
  function tick() {
    const left = Math.max(0, deadline - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    const el = document.getElementById("qrCountdown");
    const bar = document.getElementById("qrBar");
    if (el) el.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    if (bar) bar.style.width = `${(left / (QR_EXPIRY_MIN * 60000)) * 100}%`;
    if (left <= 0) {
      clearInterval(qrCountdownInterval);
      qrCountdownInterval = null;
      const p = document.getElementById("qrPanel");
      if (p) {
        p.querySelector(".qr-body").innerHTML =
          `<div class="qr-expired">⏱️ This QR code has expired.<br>Generate a new route to get a fresh code.</div>`;
      }
    }
  }
  tick();
  qrCountdownInterval = setInterval(tick, 1000);
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
await loadConfig();
setFloor(parseInt(config.defaultFloor) || 1);

// Show home screen on load (unless idle is disabled)
if (!disableIdleAndIntro) {
  showHomeScreen();
} else {
  // If idle is disabled, start the countdown without showing the overlay
  restartCountdown();
}

// Hide zoom hint after 4 seconds
const zoomHint = document.getElementById("zoomHint");
if (zoomHint) setTimeout(() => zoomHint.classList.add("hide"), 4000);
