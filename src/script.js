// script.js
import {
  schoolGraph,
  getRoomFloor,
  STAIR_NODES,
  allRooms,
} from "./schoolGraph.js";
import { findShortestPath } from "./pathfinding.js";
import { displayRooms } from "./displayRooms.js";

const POD_NAMES = {
  A_Pod: "A Pod",
  B_Pod: "B Pod",
  C_Pod: "C Pod",
  Z_Pod: "Z Pod",
  D_Wing: "D Wing",
  E_Wing: "E Wing",
  F_Wing: "F Wing",
  Commons: "Commons",
};

const SECONDARY_STAIRS = new Set(["Z2", "A2", "B2"]);

// ── Room number helpers ──────────────────────────────────────────
function getRoomInPodNum(roomName) {
  const num = parseInt(roomName.replace(/[^0-9]/g, ""), 10);
  if (isNaN(num)) return null;
  return num % 100;
}

function isInnerHallwayRoom(roomName) {
  // Rooms X01–X14 are on the inner hallway (water fountain / locker path)
  const n = getRoomInPodNum(roomName);
  return n !== null && n >= 1 && n <= 14;
}

function isInterPodCorridorRoom(roomName) {
  // Rooms X15–X30+ including X122, X125–X127 are on the inter-pod corridor side
  // or special rooms like X118(bath), X119(node), X115(node), X122(entry), X125-X127
  const n = getRoomInPodNum(roomName);
  return n !== null && (n === 0 || n >= 15);
}

function isAdminRoom(roomName) {
  // A14–A32 (floor 1 admin) and A51A/B, A52–A71 (floor 2 admin)
  if (!roomName.startsWith("A")) return false;
  const n = parseInt(roomName.replace(/[^0-9]/g, ""), 10);
  if (isNaN(n)) return false;
  return (n >= 14 && n <= 32) || (n >= 51 && n <= 71);
}

// ── After-stair navigation hint ──────────────────────────────────
// Called after the user has arrived at the secondary stair landing.
// Returns guidance on which direction to walk to reach the destination.
function getAfterSecondaryStairHint(stairNode, destRoom, destPod) {
  const podLetter = destRoom[0]; // 'A', 'B', 'C', 'Z'
  const inPodNum = getRoomInPodNum(destRoom);

  if (stairNode === "A2") {
    // A2 is in the connector between B Pod and A Pod
    // Going up: B Pod is on the RIGHT, A Pod is on the LEFT
    if (destPod.startsWith("B_Pod")) {
      if (isInnerHallwayRoom(destRoom)) {
        return `At the top of A2, turn <strong>RIGHT</strong> into B Pod. Walk down the hallway toward the water fountain and lockers — ${destRoom} is along this path (B101–B114 side).`;
      }
      return `At the top of A2, turn <strong>RIGHT</strong> into B Pod. Follow the inter-pod corridor toward B100 — ${destRoom} is off this corridor.`;
    }
    if (destPod.startsWith("A_Pod")) {
      if (isAdminRoom(destRoom)) {
        return `At A2, turn <strong>LEFT</strong> into A Pod. Pass through A Pod toward A11 (Front Desk). The admin rooms (A14–A32 / A51–A71) are on the <strong>right side path behind A11</strong>, opposite the A1 stairwell entrance.`;
      }
      if (isInnerHallwayRoom(destRoom)) {
        return `At A2, turn <strong>LEFT</strong> into A Pod. Walk down the hallway toward the water fountain and lockers — ${destRoom} is along this path (A101–A114 side).`;
      }
      return `At A2, turn <strong>LEFT</strong> into A Pod. Follow the inter-pod corridor toward A100 — ${destRoom} is off this corridor.`;
    }
  }

  if (stairNode === "Z2") {
    // Z2 is in the connector between A Pod and Z Pod
    if (destPod.startsWith("A_Pod")) {
      if (isAdminRoom(destRoom)) {
        return `At Z2, enter A Pod. Pass through toward A11 (Front Desk). Admin rooms are on the <strong>right side path behind A11</strong>, opposite the A1 stairwell entrance.`;
      }
      if (isInnerHallwayRoom(destRoom)) {
        return `At Z2, enter A Pod and walk toward the water fountain / lockers — ${destRoom} is along this path (A101–A114 side).`;
      }
      return `At Z2, enter A Pod and follow the inter-pod corridor toward A100 — ${destRoom} is off this corridor.`;
    }
    if (destPod.startsWith("Z_Pod")) {
      if (isInnerHallwayRoom(destRoom)) {
        return `At Z2, enter Z Pod and walk toward the water fountain / lockers — ${destRoom} is along this path (Z101–Z114 side).`;
      }
      return `At Z2, enter Z Pod and follow the inter-pod corridor toward Z100 — ${destRoom} is off this corridor.`;
    }
  }

  if (stairNode === "B2") {
    // B2 is in the connector between B Pod and C Pod
    if (destPod.startsWith("B_Pod")) {
      if (isInnerHallwayRoom(destRoom)) {
        return `At B2, enter B Pod and walk toward the water fountain / lockers — ${destRoom} is along this path (B101–B114 side).`;
      }
      return `At B2, enter B Pod and follow the inter-pod corridor toward B100 — ${destRoom} is off this corridor.`;
    }
    if (destPod.startsWith("C_Pod")) {
      if (isInnerHallwayRoom(destRoom)) {
        return `At B2, enter C Pod and walk toward the water fountain / lockers — ${destRoom} is along this path (C101–C114 side).`;
      }
      return `At B2, enter C Pod and follow the inter-pod corridor toward C100 — ${destRoom} is off this corridor.`;
    }
  }

  return null;
}

// ── After-primary-stair navigation hint ─────────────────────────
// When using the pod's own staircase (A1/B1/C1/Z1), landing inside that pod.
function getAfterPrimaryStairHint(stairNode, destRoom, destPod) {
  const podLetter = stairNode.replace("_Stair", "")[0]; // 'A','B','C','Z'
  const podFloor = getRoomFloor(destRoom) || 1;
  const inPodNum = getRoomInPodNum(destRoom);

  if (!destPod) return null;

  // The primary stair lands INSIDE the pod (e.g. B1 red dot near B115/B108)
  // After landing, rooms B01–B14 → go toward water fountain/lockers
  // Rooms B15+ / B118 / B122 / B125–B127 / B128 → go toward inter-pod corridor
  // Admin rooms → right side behind front desk

  if (isAdminRoom(destRoom)) {
    return `You are now inside A Pod at the A${podFloor === 1 ? "1" : podFloor === 2 ? "" : ""}  stairwell. The admin rooms are on the <strong>right side path behind A11 (Front Desk)</strong>, opposite to where you entered. Walk toward A11 and take the right-side corridor.`;
  }
  if (isInnerHallwayRoom(destRoom)) {
    return `You are now inside ${podLetter} Pod at the main stairwell. Walk toward the <strong>water fountain and lockers</strong> — ${destRoom} is along this hallway path (${podLetter}101–${podLetter}114 side).`;
  }
  if (inPodNum !== null && inPodNum >= 15) {
    return `You are now inside ${podLetter} Pod at the main stairwell. Walk toward the <strong>inter-pod corridor</strong> (the hallway that connects all pods via their 100-series nodes) — ${destRoom} is off this corridor.`;
  }
  return null;
}

// ── Pod key helpers ──────────────────────────────────────────────
function getPodKey(node) {
  if (!node) return null;
  const m = node.match(/^([A-Z](?:_Pod|_Wing))_\d$/);
  if (m) return m[1];
  if (node.startsWith("Commons_")) return "Commons";
  return null;
}

function podDisplayName(node) {
  if (!node) return "";
  const key = getPodKey(node);
  return key
    ? POD_NAMES[key] || key.replace(/_/g, " ")
    : node.replace(/_/g, " ");
}

function floorLabel(f) {
  return f === 1 ? "1st floor" : f === 2 ? "2nd floor" : "3rd floor";
}

// ── Walk descriptions between pods ──────────────────────────────
function getWalkDescription(fromNode, toNode, floor) {
  const from =
    getPodKey(fromNode) ||
    (fromNode?.startsWith("Commons") ? "Commons" : fromNode);
  const to =
    getPodKey(toNode) || (toNode?.startsWith("Commons") ? "Commons" : toNode);
  const f = floor || 1;

  const interPodCorridor = {
    1: "inter-pod corridor (Z100 → A100 → B100 → C100 → ends at D150 Large Cafeteria)",
    2: "inter-pod corridor (Z200 → A200 → B200 → C200 → ends at D213 Weight Room)",
    3: "inter-pod corridor (Z300 → A300 → B300 → C300)",
  };

  const desc = {
    "C_Pod->Commons": `Walk south through C Pod. Pass through C100 (Food Court hub) into the main Commons hallway. You are using the ${interPodCorridor[f]}.`,
    "Commons->C_Pod": `Enter C Pod heading north from the Commons through C100 into the main C Pod hallway.`,
    "B_Pod->Commons": `Walk west from B Pod through B100 into the Commons. The Commons connects C Pod, B Pod, and D Wing.`,
    "Commons->B_Pod": `Walk east from the Commons into B Pod through B100.`,
    "B_Pod->C_Pod": `Walk northwest from B Pod toward C Pod. Pass through the B114 area near the B Stairwell (B1, the <em>inside</em> stairwell near B115/B108) at the B Pod / Commons junction.`,
    "C_Pod->B_Pod": `Walk southeast from C Pod toward B Pod, passing through the C101/C102 area near the C Pod / Commons junction.`,
    "A_Pod->B_Pod": `Walk northwest through the A–B connector hallway. <strong>Note:</strong> the A2 stairwell (blue dot) is located in this connector between B Pod and A Pod — B Pod is on the right at the top of A2, A Pod is on the left. The A Stairwell (A1, the <em>inside</em> stairwell) is also accessible from within A Pod near A115/A108. Pass near B100 and B125b (Maker Space).`,
    "B_Pod->A_Pod": `Walk southeast through the connector hallway from B Pod into A Pod. <strong>Note:</strong> the A2 stairwell (blue dot) is in this connector — B Pod is on the right at the top of A2, A Pod is on the left. Pass near B100 / B125b (Maker Space).`,
    "A_Pod->Z_Pod": `Walk south through A Pod toward the lobby area. Pass through the A Pod entrance (near A11 Front Desk / A122). The Z Stairwell (Z1) is at this A Pod / Z Pod junction near A122 / Z127. The Z2 stairwell (secondary) is also in this connector area.`,
    "Z_Pod->A_Pod": `Walk north through Z Pod past the lobby (near Z122 / A11 Front Desk). The Z1 stairwell and Z2 secondary stairwell are both at this junction.`,
    "Commons->D_Wing": `Walk west from the Commons into D Wing. <strong>Shortcut:</strong> from C Pod, use the cutthrough hallway at C115 which leads directly in front of D101 (Small Cafeteria), bypassing the main Commons.`,
    "D_Wing->Commons": `Walk east through D Wing back into the Commons. D Wing contains the auditorium (D138), gym (D123), pool (D136), and cafeteria (D150 / D101).`,
    "D_Wing->E_Wing": `Continue west through D Wing past the gym area into E Wing.`,
    "E_Wing->D_Wing": `Walk east through E Wing back into D Wing.`,
    "D_Wing->F_Wing": `Continue west through D Wing into F Wing.`,
    "F_Wing->D_Wing": `Walk east through F Wing back into D Wing.`,
    "Z_Pod->Commons": `Walk north through Z Pod, through the Z Pod / A Pod junction, continue north through A Pod, through the A–B connector (past A2 stairwell), into the Commons via B Pod.`,
    "Commons->Z_Pod": `From the Commons, walk south through B Pod, through the A–B connector (past A2 stairwell), through A Pod, and south through the A Pod / Z Pod junction into Z Pod.`,
  };

  return (
    desc[`${from}->${to}`] ||
    `Walk from ${podDisplayName(fromNode)} to ${podDisplayName(toNode)}`
  );
}

// ── Stair descriptions ───────────────────────────────────────────
const STAIR_LOCATIONS = {
  // Primary stairs — INSIDE each pod (red dot equivalent)
  A_Stair:
    "the A Stairwell (A1) — the <strong>inside stairwell</strong> located within A Pod near A115 and A108",
  B_Stair:
    "the B Stairwell (B1) — the <strong>inside stairwell</strong> located within B Pod near B115 and B108",
  C_Stair:
    "the C Stairwell (C1) — the <strong>inside stairwell</strong> located within C Pod near C115 and C108",
  Z_Stair:
    "the Z Stairwell (Z1) — the <strong>inside stairwell</strong> located within Z Pod near Z115 and Z108",
};

const SECONDARY_STAIR_DESC = {
  // Secondary stairs — BETWEEN pods in connector hallways (blue dot equivalent)
  Z2: {
    loc: "the Z2 stairwell — the <strong>connector stairwell between Z Pod and A Pod</strong>, located in the hallway between the two pods",
    label: "Z2",
    orientation: "Z Pod is on one side, A Pod is on the other",
  },
  A2: {
    loc: "the A2 stairwell — the <strong>connector stairwell between A Pod and B Pod</strong>, located in the hallway between the two pods (near B126/B126c below, above A Pod)",
    label: "A2",
    orientation: "going up: B Pod is on the RIGHT, A Pod is on the LEFT",
  },
  B2: {
    loc: "the B2 stairwell — the <strong>connector stairwell between B Pod and C Pod</strong>, located in the hallway between the two pods",
    label: "B2",
    orientation: "B Pod is on one side, C Pod is on the other",
  },
};

function getStairDescription(stairNode, fromFloor, toFloor) {
  const dir = toFloor > fromFloor ? "up" : toFloor < fromFloor ? "down" : null;
  const fLabel = floorLabel(toFloor);

  if (SECONDARY_STAIRS.has(stairNode)) {
    const d = SECONDARY_STAIR_DESC[stairNode];
    if (dir) {
      return {
        main: `Take ${d.loc} <strong>${dir}</strong> to the <strong>${fLabel}</strong>`,
        sub: `Orientation: ${d.orientation} · Look for signs labeled "${d.label}"`,
      };
    }
    return {
      main: `Pass through ${d.loc} to cross between pods`,
      sub: `Orientation: ${d.orientation} · Look for the passageway labeled "${d.label}"`,
    };
  }

  const loc =
    STAIR_LOCATIONS[stairNode] ||
    `the ${stairNode.replace("_Stair", "")} stairwell`;
  return {
    main: `Take ${loc} <strong>${dir || "to"}</strong> the <strong>${fLabel}</strong>`,
    sub: `This is the stairwell <em>inside</em> the pod · Look for signs labeled "${stairNode.replace("_Stair", "")}"`,
  };
}

// ── Room arrival hints ───────────────────────────────────────────
const ROOM_HINTS = {
  A11: "Front Desk — near the main A Pod entrance, right side path",
  A100: "Hallway hub — inter-pod corridor intersection of A Pod",
  A115: "Hallway node — mid-hallway intersection in A Pod",
  A118: "Bathroom — near A115 hallway node",
  A119: "Hallway node — end of A Pod hallway",
  A122: "A Pod hallway area — near the Z Pod / A Pod junction",
  A125: "Wing end, past A119",
  A126: "Wing end, past A119",
  A127: "Wing end, past A119",

  Z100: "Hallway hub — inter-pod corridor intersection of Z Pod",
  Z115: "Hallway node — mid-hallway intersection in Z Pod",
  Z118: "Bathroom — near Z115 hallway node",
  Z119: "Hallway node — end of Z Pod hallway",
  Z122: "Student Entry / Attendance — main student entrance, accessible from the Z Pod side",
  Z125: "Wing end, past Z119",
  Z126: "Wing end, past Z119",
  Z127: "Wing end, past Z119",

  B100: "Hallway hub — inter-pod corridor intersection of B Pod",
  B115: "Hallway node — mid-hallway intersection in B Pod",
  B118: "Bathroom — near B115 hallway node",
  B119: "Hallway node — end of B Pod hallway",
  B122: "B Pod hallway area",
  B125: "Dream Center — on the OPPOSITE side of B Pod from the main hallway, past B1/B115 stairwell",
  B125b:
    "Maker Space — in the A–B connector hallway area near the A2 stairwell",
  B125c: "Comet Cafe seating / Library — in the A–B connector hallway area",
  B126: "Wing end, past B119",
  B127: "Wing end, past B119",
  B128: "Comet Cafe (purchase counter) — near B115/B1 stairwell area",
  B129: "Dream Center Annex — ONLY accessible through Dream Center (B125). Enter B125 first.",

  C100: "Hallway hub — inter-pod corridor intersection / Food Court area",
  C115: "Hallway node — mid-hallway intersection. Cutthrough hallway here leads directly to D101.",
  C118: "Bathroom — near C115 hallway node",
  C119: "Hallway node — end of C Pod main hallway",
  C121: "Curved lobby / auditorium lobby — micro-hallway cluster with C122",
  C121A: "Curved lobby — part of C121 cluster",
  C122: "Curved lobby — micro-hallway cluster with C121",
  C122A: "Curved lobby — part of C122 cluster",
  C123: "Curved lobby area — NOT on the main straight hallway",
  C123A: "Curved lobby area — NOT on the main straight hallway",
  C124: "Curved lobby area — NOT on the main straight hallway",
  C125: "Harvard Room — auditorium-style, NOT on the main hallway",
  C126: "Inner hallway — C126 sub-rooms (A–P) connect only through C126",
  C126A: "Internal to C126 — enter through C126 first",
  C126B: "Internal to C126",
  C126C: "Internal to C126",
  C126D: "Internal to C126",
  C126E: "Internal to C126",
  C126F: "Internal to C126",
  C126G: "Internal to C126",
  C126H: "Internal to C126",
  C126J: "Internal to C126",
  C126K: "Internal to C126",
  C126L: "Internal to C126",
  C126M: "Internal to C126",
  C126N: "Internal to C126",
  C126P: "Internal to C126",
  C130: "Curved lobby area — NOT on the main straight hallway",

  D101: "Small Cafeteria — accessible via the C115 cutthrough hallway OR through the Commons",
  D123: "Field House / Gym — deep in D Wing, west side",
  D136: "Pool — deep in D Wing, west side",
  D138: "Auditorium — D Wing, south side",
  D150: "Large Commons / Cafeteria — end of the 1st floor inter-pod corridor (Z100→A100→B100→C100→D150)",
  D152: "Cafeteria purchase area — adjacent to D150",
  D158: "Music private rooms — D Wing near auditorium",
  D160: "Lunch purchase counters — near D150 cafeteria",
  D212: "Drama Room — Floor 2, D Wing",
  D213: "Weight Room — end of the 2nd floor inter-pod corridor (Z200→A200→B200→C200→D213)",
};

// Admin rooms share the same hint
const ADMIN_HINT =
  "Admin suite — on the RIGHT-SIDE PATH behind A11 (Front Desk), opposite from the A1 stairwell entrance. Walk past A11 and take the right corridor.";
for (let i = 14; i <= 32; i++) ROOM_HINTS[`A${i}`] = ADMIN_HINT;
ROOM_HINTS["A32"] =
  "Nurse's Office — accessible from A100 (the inter-pod corridor outside the main A Pod hallway)";
const adminF2 = ["A51A", "A51B", "A52", "A53", "A53A", "A53B", "A53C", "A53D"];
for (let i = 54; i <= 71; i++) adminF2.push(`A${i}`);
adminF2.forEach((r) => {
  ROOM_HINTS[r] =
    "Admin suite (Floor 2) — on the right-side path behind the admin area. Access via A Pod 2nd floor.";
});

// Generic inner-hallway rooms (B/A/C/Z 101–114) get water fountain hint
["A", "B", "C", "Z"].forEach((pod) => {
  [1, 2, 3].forEach((floor) => {
    const prefix = floor === 1 ? "" : floor.toString();
    for (let n = 1; n <= 14; n++) {
      const key = `${pod}${floor > 1 ? floor * 100 + n : n < 10 ? n : n}`;
      // Build actual key: A101, A201, A301, B101, etc.
      const roomKey = `${pod}${floor === 1 ? (n < 10 ? "10" + n : "1" + n) : floor * 100 + n}`;
      if (!ROOM_HINTS[roomKey]) {
        ROOM_HINTS[roomKey] =
          `Inner hallway (${pod}101–${pod}114 side) — walk toward the water fountain and lockers after entering the pod`;
      }
    }
  });
});

function getArrivalHint(roomName) {
  if (ROOM_HINTS[roomName]) return ROOM_HINTS[roomName];
  const n = getRoomInPodNum(roomName);
  if (n === null) return null;
  if (n === 0) return "Hallway hub — inter-pod corridor intersection";
  if (n <= 14)
    return "Inner hallway — walk toward the water fountain and lockers after entering the pod";
  if (n === 15) return "Mid-hallway node";
  if (n <= 19) return "Near the hallway end node";
  return "Near the wing end / inter-pod corridor side";
}

// ── Directions generator ─────────────────────────────────────────
function generateSteps(path, start, end) {
  const steps = [];
  const startFloor = getRoomFloor(start) || 1;
  const endFloor = getRoomFloor(end) || 1;
  let prevFloor = startFloor;
  let prevPodNode = schoolGraph[start]?.[0] || null;

  steps.push({
    icon: "📍",
    text: `Start at <strong>${displayRooms[start] || start}</strong>`,
    sub: [
      floorLabel(startFloor),
      podDisplayName(prevPodNode),
      getArrivalHint(start),
    ]
      .filter(Boolean)
      .join(" · "),
  });

  let stairCount = 0;
  let lastStair = null;

  for (let i = 1; i < path.length; i++) {
    const node = path[i];

    // ── Stair node ──────────────────────────────────────────────
    if (STAIR_NODES.has(node)) {
      stairCount++;
      let toFloor = prevFloor;
      for (let j = i + 1; j < path.length; j++) {
        const f = getRoomFloor(path[j]);
        if (f !== null) {
          toFloor = f;
          break;
        }
      }
      const desc = getStairDescription(node, prevFloor, toFloor);
      const isUp = toFloor > prevFloor;
      const isDown = toFloor < prevFloor;
      steps.push({
        icon: isUp ? "⬆️" : isDown ? "⬇️" : "↔️",
        text: desc.main,
        sub: desc.sub,
      });
      prevFloor = toFloor;
      lastStair = node;

      // After secondary stair, add orientation hint if next room is the destination
      if (SECONDARY_STAIRS.has(node) && i + 1 < path.length) {
        const nextNode = path[i + 1];
        // Find the eventual destination pod
        const destPod = allRooms[end];
        if (destPod) {
          const hint = getAfterSecondaryStairHint(node, end, destPod);
          if (hint) {
            steps.push({
              icon: "↩️",
              text: hint,
              sub: `Navigating within ${podDisplayName(destPod + "_1")} after exiting stairwell`,
            });
          }
        }
      }
      continue;
    }

    // ── Pod / wing hub ──────────────────────────────────────────
    if (/^[A-Z](?:_Pod|_Wing)_\d$/.test(node) || /^Commons_\d$/.test(node)) {
      const pk = getPodKey(prevPodNode);
      const ck =
        getPodKey(node) || (node.startsWith("Commons") ? "Commons" : null);
      if (pk && ck && pk === ck) {
        prevPodNode = node;
        continue;
      }
      steps.push({
        icon: "🚶",
        text: getWalkDescription(prevPodNode, node, prevFloor),
        sub: `${floorLabel(prevFloor)} · heading toward ${podDisplayName(node)}`,
      });
      prevPodNode = node;
      continue;
    }

    // ── Destination ─────────────────────────────────────────────
    if (node === end) {
      const endPodName = podDisplayName(schoolGraph[end]?.[0] || "");
      const hint = getArrivalHint(end);

      // Special access warnings
      const accessNote =
        end === "B129"
          ? "⚠ B129 is ONLY accessible through Dream Center (B125) — enter B125 first."
          : end.startsWith("C126") && end !== "C126"
            ? `⚠ ${end} is internal to C126 — enter through C126 first.`
            : end === "C125"
              ? "Note: Harvard Room (C125) is auditorium-style, not on the main hallway."
              : end === "C123" || end === "C124" || end === "C130"
                ? "Note: This room is in the curved lobby area, not the main straight hallway."
                : null;

      // After-primary-stair hint (if last stair used was a primary stair)
      let primaryStairHint = null;
      if (lastStair && !SECONDARY_STAIRS.has(lastStair)) {
        const destPod = allRooms[end];
        if (destPod)
          primaryStairHint = getAfterPrimaryStairHint(lastStair, end, destPod);
      }

      steps.push({
        icon: "🎯",
        text: `Arrive at <strong>${displayRooms[end] || end}</strong>${accessNote ? `<br><span style="color:#ffaa00;font-size:0.9em">${accessNote}</span>` : ""}${primaryStairHint ? `<br><span style="font-size:0.9em">${primaryStairHint}</span>` : ""}`,
        sub: [floorLabel(endFloor), endPodName, hint]
          .filter(Boolean)
          .join(" · "),
      });
    }
  }

  const floors = [...new Set([startFloor, endFloor])].sort();
  return { steps, stairCount, floors };
}

// ── DOM ──────────────────────────────────────────────────────────
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const datalist = document.getElementById("rooms");
const goBtn = document.getElementById("goBtn");
const dirBox = document.getElementById("directions");

Object.entries(displayRooms)
  .sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  )
  .forEach(([room, label]) => {
    const opt = document.createElement("option");
    opt.value = room;
    opt.textContent = label;
    datalist.appendChild(opt);
  });

[startInput, endInput].forEach((inp) => {
  inp.addEventListener("input", () => {
    const pos = inp.selectionStart;
    inp.value = inp.value.toUpperCase();
    inp.setSelectionRange(pos, pos);
  });
});

goBtn.addEventListener("click", go);
[startInput, endInput].forEach((inp) =>
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  }),
);

function go() {
  const start = startInput.value.trim().toUpperCase();
  const end = endInput.value.trim().toUpperCase();
  dirBox.className = "directions-box";
  dirBox.innerHTML = "";

  if (!start || !end)
    return showError("Please enter both a start room and destination.");
  if (start === end) return showError("You're already there! 🎉");
  if (!schoolGraph[start])
    return showError(`Room "${start}" not found. Check the spelling.`);
  if (!schoolGraph[end])
    return showError(`Room "${end}" not found. Check the spelling.`);

  const path = findShortestPath(schoolGraph, start, end);
  if (!path) return showError("No route could be found between those rooms.");

  const { steps, stairCount, floors } = generateSteps(path, start, end);

  const floorBadge =
    floors.length > 1
      ? `<span class="badge badge-warn">Floors ${floors.join(" → ")}</span>`
      : `<span class="badge badge-ok">Floor ${floors[0]}</span>`;
  const stairBadge =
    stairCount > 0
      ? `<span class="badge badge-stair">🪜 ${stairCount} stairwell${stairCount > 1 ? "s" : ""}</span>`
      : "";

  let html = `
    <div class="dir-header">
      <div class="dir-title">Route: <strong>${displayRooms[start] || start}</strong> → <strong>${displayRooms[end] || end}</strong></div>
      <div class="dir-badges">${floorBadge}${stairBadge}</div>
    </div>
    <ol class="dir-steps">`;

  steps.forEach((step) => {
    html += `
      <li class="dir-step">
        <span class="step-icon">${step.icon}</span>
        <div class="step-body">
          <div class="step-main">${step.text}</div>
          ${step.sub ? `<div class="step-sub">${step.sub}</div>` : ""}
        </div>
      </li>`;
  });

  html += `</ol>`;
  dirBox.className = "directions-box dir-success";
  dirBox.innerHTML = html;
}

function showError(msg) {
  dirBox.className = "directions-box dir-error";
  dirBox.innerHTML = `<p>⚠️ ${msg}</p>`;
}
